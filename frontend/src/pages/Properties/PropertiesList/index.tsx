import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Button,
  Badge,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getProperties } from "../../../slices/properties/thunk";

const PropertiesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const { properties, loading, error } = useSelector((state: any) => state.Properties);

  useEffect(() => {
    document.title = "Properties | Agent Dashboard";
    console.log('[PropertiesList] Mounting component, dispatching getProperties');
    dispatch(getProperties(undefined));
  }, [dispatch]);

  const safeProperties = Array.isArray(properties) ? properties.filter(Boolean) : [];

  useEffect(() => {
    console.log('[PropertiesList] Properties state updated:', {
      loading,
      propertiesCount: safeProperties.length,
      error
    });
  }, [safeProperties, loading, error]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary';
      case 'PUBLISHED':
        return 'success';
      case 'SOLD':
        return 'primary';
      case 'ARCHIVED':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Properties" pageTitle="Seller Portal" />

          <Row className="mb-3">
            <Col lg={12}>
              <div className="d-flex justify-content-end">
                <Button
                  color="success"
                  onClick={() => navigate('/properties/new')}
                  style={{ backgroundColor: '#A2CB8B', borderColor: '#A2CB8B' }}
                >
                  <i className="ri-add-line me-1"></i>
                  Create New Property
                </Button>
              </div>
            </Col>
          </Row>

          {/* Error Display */}
          {error && (
            <Row className="mb-3">
              <Col lg={12}>
                <Card className="border-danger">
                  <CardBody className="py-3">
                    <div className="alert alert-danger mb-0">
                      <i className="ri-error-warning-line me-2"></i>
                      <strong>Error Loading Properties:</strong> {error?.message || 'Failed to fetch properties'}
                      <br />
                      <small className="text-muted mt-2 d-block">
                        Check browser console for more details. Ensure you are logged in and the backend is running.
                      </small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}

          {loading ? (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading properties...</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          ) : safeProperties && safeProperties.length > 0 ? (
            <Row>
              {safeProperties.map((property: any) => {
                const media = Array.isArray(property?.media) ? property.media.filter(Boolean) : [];
                const coverUrl = media.find((m: any) => m?.isCover)?.url || media[0]?.url;
                return (
                <Col lg={4} md={6} key={property.id} className="mb-4">
                  <Card className="border shadow-sm h-100">
                    <CardBody className="p-0">
                      {coverUrl && (
                        <img
                          src={coverUrl}
                          alt={property?.title || "Property"}
                          className="img-fluid rounded-top"
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      )}

                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="mb-0" style={{ color: '#5B7E3C' }}>
                            {property?.title || "Untitled Property"}
                          </h5>
                          <Badge color={getStatusColor(property?.status)} pill>
                            {property?.status || "DRAFT"}
                          </Badge>
                        </div>

                        <h4 className="mb-2" style={{ color: '#C44545' }}>
                          ₱{Number(property?.price_php || 0).toLocaleString()}
                        </h4>

                        <p className="text-muted mb-2">
                          <i className="ri-map-pin-line me-1"></i>
                          {property?.address?.city_municipality || "N/A"}, {property?.address?.province || "N/A"}
                        </p>

                        {(property.bedrooms || property.bathrooms) && (
                          <div className="d-flex gap-3 mb-3">
                            {property.bedrooms && (
                              <span className="text-muted">
                                <i className="ri-hotel-bed-line me-1"></i>
                                {property.bedrooms} Beds
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="text-muted">
                                <i className="ri-drop-line me-1"></i>
                                {property.bathrooms} Baths
                              </span>
                            )}
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <Button
                            color="primary"
                            size="sm"
                            className="flex-grow-1"
                            onClick={() => navigate(`/properties/${property?.id}/edit`)}
                            style={{ backgroundColor: '#5B7E3C', borderColor: '#5B7E3C' }}
                          >
                            <i className="ri-edit-line me-1"></i>
                            Edit
                          </Button>
                          <Button
                            color="light"
                            size="sm"
                            onClick={() => navigate(`/properties/${property?.id}/edit`)}
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                );
              })}
            </Row>
          ) : (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody className="text-center py-5">
                    <i className="ri-home-4-line display-1 text-muted mb-3"></i>
                    <h4>No Properties Yet</h4>
                    <p className="text-muted">Create your first property listing to get started.</p>
                    <Button
                      color="success"
                      onClick={() => navigate('/properties/new')}
                      style={{ backgroundColor: '#A2CB8B', borderColor: '#A2CB8B' }}
                    >
                      <i className="ri-add-line me-1"></i>
                      Create Property
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PropertiesList;

