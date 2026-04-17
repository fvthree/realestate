import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Progress,
  Button,
} from "reactstrap";
import classnames from "classnames";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { PropertyFormData } from "../../../types/property";
import {
  createProperty,
  updateProperty,
  getProperty,
  uploadPropertyMedia,
} from "../../../slices/properties/thunk";
import { clearPropertyState } from "../../../slices/properties/reducer";

// Import step components
import BasicInfoStep from "./Steps/BasicInfoStep";
import LocationStep from "./Steps/LocationStep";
import MediaStep from "./Steps/MediaStep";
import ReviewStep from "./Steps/ReviewStep";

const CreateEditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const [activeTab, setActiveTab] = useState<number>(1);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [passedSteps, setPassedSteps] = useState<number[]>([1]);
  const [isDraft, setIsDraft] = useState<boolean>(true);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);

  const { property, loading, success } = useSelector((state: any) => state.Properties);

  const isEditMode = Boolean(id);

  // Validation schema - MUST be defined before useEffect
  const validationSchema = Yup.object({
    // Step 1: Basic Info
    title: Yup.string().required("Property title is required"),
    property_type: Yup.string().required("Property type is required"),
    price_php: Yup.number().positive("Price must be positive").required("Price is required"),
    bedrooms: Yup.number().min(0, "Bedrooms cannot be negative"),
    bathrooms: Yup.number().min(0, "Bathrooms cannot be negative"),
    lot_area_sqm: Yup.number().positive("Lot area must be positive"),
    floor_area_sqm: Yup.number().positive("Floor area must be positive"),
    description: Yup.string(),

    // Step 2: Location
    region: Yup.string().required("Region is required"),
    province: Yup.string().required("Province is required"),
    city: Yup.string().required("City is required"),
    barangay: Yup.string(),
    postal_code: Yup.string(),
    street_address: Yup.string(),
    latitude: Yup.number(),
    longitude: Yup.number(),
  });

  const validation = useFormik<PropertyFormData>({
    enableReinitialize: true,
    initialValues: {
      title: "",
      property_type: "",
      price_php: "",
      bedrooms: "",
      bathrooms: "",
      lot_area_sqm: "",
      floor_area_sqm: "",
      description: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      postal_code: "",
      street_address: "",
      latitude: "",
      longitude: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSaveProperty(values, false);
    },
  });

  useEffect(() => {
    document.title = isEditMode ? "Edit Property | Agent Dashboard" : "Create Property | Agent Dashboard";

    if (isEditMode && id) {
      dispatch(getProperty(id));
    }

    return () => {
      dispatch(clearPropertyState());
    };
  }, [dispatch, id, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && property) {
      validation.setValues({
        title: property.title || "",
        property_type: property.property_type || "",
        price_php: property.price_php?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        lot_area_sqm: property.lot_area_sqm?.toString() || "",
        floor_area_sqm: property.floor_area_sqm?.toString() || "",
        description: property.description || "",
        region: property.address?.region || "",
        province: property.address?.province || "",
        city: property.address?.city_municipality || "",
        barangay: property.address?.barangay || "",
        postal_code: property.address?.postal_code || "",
        street_address: property.address?.street_address || "",
        latitude: property.geo?.latitude?.toString() || "",
        longitude: property.geo?.longitude?.toString() || "",
      });

      if (property.media && property.media.length > 0) {
        const normalizedMedia = property.media.map((media: any) => ({
          ...media,
          isCover: media.isCover ?? media.is_cover ?? false,
          url: media.url ?? media.public_url ?? media.publicUrl,
        }));
        setUploadedMedia(normalizedMedia);
      }

      setIsDraft(property.status === 'DRAFT');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property, isEditMode]);
  // Note: validation is intentionally omitted from deps to avoid infinite loop
  // validation.setValues is stable and doesn't need to be in dependencies

  // Handle save as draft
  const handleSaveDraft = async () => {
    const values = validation.values;
    await handleSaveProperty(values, true);
  };

  // Handle save/update property
  const handleSaveProperty = async (values: PropertyFormData, asDraft: boolean) => {
    try {
      // Transform form data to backend API format
      const address: any = {
        region: values.region || "",
        province: values.province || "",
        city_municipality: values.city || "", // Backend expects city_municipality
      };

      // Add optional address fields only if they have values
      if (values.barangay) address.barangay = values.barangay;
      if (values.postal_code) address.postal_code = values.postal_code;
      if (values.street_address) address.street_address = values.street_address;

      // Build geo object only if both lat and long are provided
      const geo: any = {};
      if (values.latitude && values.longitude) {
        geo.latitude = parseFloat(values.latitude);
        geo.longitude = parseFloat(values.longitude);
      }

      // Build property data in backend API format
      const propertyData: any = {
        title: values.title || "",
        description: values.description || "",
        price_php: values.price_php ? parseFloat(values.price_php) : 0,
        property_type: values.property_type || "", // Backend expects property_type
        address: address,
      };

      // Add optional numeric fields only if they have values
      if (values.bedrooms) propertyData.bedrooms = parseInt(values.bedrooms);
      if (values.bathrooms) propertyData.bathrooms = parseInt(values.bathrooms);
      if (values.lot_area_sqm) propertyData.lot_area_sqm = parseFloat(values.lot_area_sqm);
      if (values.floor_area_sqm) propertyData.floor_area_sqm = parseFloat(values.floor_area_sqm);

      // Add geo only if it has values
      if (Object.keys(geo).length > 0) {
        propertyData.geo = geo;
      }

      console.log("📤 Submitting property data to backend:", JSON.stringify(propertyData, null, 2));

      try {
        let result;
        if (isEditMode && id) {
          result = await dispatch(updateProperty({ id, property: propertyData }));
        } else {
          result = await dispatch(createProperty(propertyData));
        }

        // After successful creation, upload media if there are any new files
        if (result.payload && result.payload.id && uploadedMedia.length > 0) {
          const newFiles = uploadedMedia.filter((media: any) => media instanceof File);
          if (newFiles.length > 0) {
            const uploadedServerMedia: any[] = [];

            for (let idx = 0; idx < newFiles.length; idx += 1) {
              const file = newFiles[idx];
              const isCover = idx === 0;
              const uploaded = await dispatch(uploadPropertyMedia({
                id: result.payload.id,
                file,
                isCover,
              })).unwrap();

              uploadedServerMedia.push({
                ...uploaded,
                isCover: uploaded.is_cover,
                is_cover: uploaded.is_cover,
                url: uploaded.public_url,
                preview: uploaded.public_url,
                name: file.name,
                size: file.size,
              });
            }

            setUploadedMedia((prev) => {
              const persistedMedia = prev.filter((media: any) => !(media instanceof File));
              return [...persistedMedia, ...uploadedServerMedia];
            });
            console.log("📤 Uploaded files for property:", result.payload.id);
          }
        }
      } catch (error) {
        console.error("❌ Error saving property:", error);
      }
    } catch (error) {
      console.error("❌ Error in handleSaveProperty:", error);
    }
  };

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!isEditMode || !isDraft) return;

    const timer = setTimeout(() => {
      if (validation.dirty) {
        handleSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.values, isDraft, isEditMode]);
  // Note: handleSaveDraft and validation.dirty intentionally omitted to avoid excessive calls

  // Navigate after successful save
  useEffect(() => {
    if (success && !loading) {
      setTimeout(() => {
        navigate('/properties');
      }, 2000);
    }
  }, [success, loading, navigate]);

  const toggleTab = (tab: number, value: number) => {
    if (activeTab !== tab) {
      const modifiedSteps = [...passedSteps, tab];
      if (tab >= 1 && tab <= 4) {
        setActiveTab(tab);
        setPassedSteps(modifiedSteps);
      }
    }
    setProgressValue(value);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          validation.values.title &&
          validation.values.property_type &&
          validation.values.price_php
        );
      case 2:
        return Boolean(
          validation.values.region &&
          validation.values.province &&
          validation.values.city
        );
      case 3:
        return uploadedMedia.length > 0;
      default:
        return true;
    }
  };

  const canPublish = (): boolean => {
    return (
      isStepValid(1) &&
      isStepValid(2) &&
      isStepValid(3) &&
      !validation.errors.title &&
      !validation.errors.property_type &&
      !validation.errors.price_php
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={isEditMode ? "Edit Property" : "Create Property"} pageTitle="Properties" />

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  {/* Save Draft Button */}
                  <div className="d-flex justify-content-end mb-3">
                    <Button
                      color="secondary"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="me-2"
                    >
                      <i className="ri-save-line me-1"></i>
                      Save Draft
                    </Button>
                  </div>

                  {/* Progress Nav */}
                  <div className="progress-nav mb-4">
                    <Progress value={progressValue} style={{ height: "1px" }} />

                    <Nav className="nav-pills progress-bar-tab custom-nav" role="tablist">
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: activeTab === 1,
                            done: activeTab > 1,
                          }, "rounded-pill")}
                          onClick={() => toggleTab(1, 0)}
                          tag="button"
                        >
                          <span className="d-none d-sm-inline">Basic Info</span>
                          <span className="d-inline d-sm-none">1</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: activeTab === 2,
                            done: activeTab > 2,
                          }, "rounded-pill")}
                          onClick={() => toggleTab(2, 33)}
                          tag="button"
                        >
                          <span className="d-none d-sm-inline">Location</span>
                          <span className="d-inline d-sm-none">2</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: activeTab === 3,
                            done: activeTab > 3,
                          }, "rounded-pill")}
                          onClick={() => toggleTab(3, 66)}
                          tag="button"
                        >
                          <span className="d-none d-sm-inline">Media</span>
                          <span className="d-inline d-sm-none">3</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: activeTab === 4,
                            done: activeTab > 4,
                          }, "rounded-pill")}
                          onClick={() => toggleTab(4, 100)}
                          tag="button"
                        >
                          <span className="d-none d-sm-inline">Review</span>
                          <span className="d-inline d-sm-none">4</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>

                  {/* Tab Content */}
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                      <BasicInfoStep validation={validation} />
                      <div className="d-flex justify-content-end mt-4">
                        <Button
                          color="primary"
                          onClick={() => toggleTab(2, 33)}
                          disabled={!isStepValid(1)}
                          style={{ backgroundColor: '#5B7E3C', borderColor: '#5B7E3C' }}
                        >
                          Next <i className="ri-arrow-right-line ms-1"></i>
                        </Button>
                      </div>
                    </TabPane>

                    <TabPane tabId={2}>
                      <LocationStep validation={validation} />
                      <div className="d-flex justify-content-between mt-4">
                        <Button
                          color="secondary"
                          onClick={() => toggleTab(1, 0)}
                        >
                          <i className="ri-arrow-left-line me-1"></i> Previous
                        </Button>
                        <Button
                          color="primary"
                          onClick={() => toggleTab(3, 66)}
                          disabled={!isStepValid(2)}
                          style={{ backgroundColor: '#5B7E3C', borderColor: '#5B7E3C' }}
                        >
                          Next <i className="ri-arrow-right-line ms-1"></i>
                        </Button>
                      </div>
                    </TabPane>

                    <TabPane tabId={3}>
                      <MediaStep
                        uploadedMedia={uploadedMedia}
                        setUploadedMedia={setUploadedMedia}
                        propertyId={id}
                      />
                      <div className="d-flex justify-content-between mt-4">
                        <Button
                          color="secondary"
                          onClick={() => toggleTab(2, 33)}
                        >
                          <i className="ri-arrow-left-line me-1"></i> Previous
                        </Button>
                        <Button
                          color="primary"
                          onClick={() => toggleTab(4, 100)}
                          disabled={!isStepValid(3)}
                          style={{ backgroundColor: '#5B7E3C', borderColor: '#5B7E3C' }}
                        >
                          Next <i className="ri-arrow-right-line ms-1"></i>
                        </Button>
                      </div>
                    </TabPane>

                    <TabPane tabId={4}>
                      <ReviewStep
                        formData={validation.values}
                        uploadedMedia={uploadedMedia}
                        canPublish={canPublish()}
                      />
                      <div className="d-flex justify-content-between mt-4">
                        <Button
                          color="secondary"
                          onClick={() => toggleTab(3, 66)}
                        >
                          <i className="ri-arrow-left-line me-1"></i> Previous
                        </Button>
                        <Button
                          color="success"
                          onClick={() => validation.handleSubmit()}
                          disabled={!canPublish() || loading}
                          style={{ backgroundColor: '#A2CB8B', borderColor: '#A2CB8B' }}
                        >
                          {loading ? "Publishing..." : (isEditMode ? "Update Property" : "Publish Property")}
                        </Button>
                      </div>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CreateEditProperty;

