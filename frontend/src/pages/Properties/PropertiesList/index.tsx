import React, { useEffect, useMemo, useState } from "react";
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
  Input,
  Label,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { getProperties } from "../../../slices/properties/thunk";
import propertyPlaceholder from "../../../assets/images/property-placeholder.svg";

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SOLD", label: "Sold" },
  { value: "ARCHIVED", label: "Archived" },
];

const PropertiesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { properties, propertiesMeta, loading, error } = useSelector(
    (state: any) => state.Properties
  );

  useEffect(() => {
    document.title = "Properties | Agent Dashboard";
  }, []);

  useEffect(() => {
    const params: Record<string, string | number> = {
      page,
      per_page: PER_PAGE,
    };
    if (statusFilter) {
      params.status = statusFilter;
    }
    dispatch(getProperties(params));
  }, [dispatch, page, statusFilter]);

  const safeProperties = useMemo(
    () => (Array.isArray(properties) ? properties.filter(Boolean) : []),
    [properties]
  );

  const total = propertiesMeta?.total ?? 0;
  const perPage = propertiesMeta?.per_page ?? PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pageNumbers = useMemo(() => {
    const numbers: number[] = [];
    for (let i = 1; i <= totalPages; i += 1) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return "No results";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Showing ${start}–${end} of ${total}`;
  }, [total, page, perPage]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "PUBLISHED":
        return "success";
      case "SOLD":
        return "primary";
      case "ARCHIVED":
        return "dark";
      default:
        return "secondary";
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Properties" pageTitle="Seller Portal" />

          <Row className="mb-3 align-items-end g-3">
            <Col xs={12} md={6} lg={4}>
              <Label className="form-label mb-1" htmlFor="property-status-filter">
                Status
              </Label>
              <Input
                id="property-status-filter"
                type="select"
                value={statusFilter}
                onChange={handleStatusChange}
                disabled={loading}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
            </Col>
            <Col xs={12} md={6} lg={8} className="text-md-end">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-end gap-2">
                <span className="text-muted small">{rangeLabel}</span>
                <Button
                  color="success"
                  onClick={() => navigate("/properties/new")}
                  style={{ backgroundColor: "#A2CB8B", borderColor: "#A2CB8B" }}
                >
                  <i className="ri-add-line me-1"></i>
                  Create New Property
                </Button>
              </div>
            </Col>
          </Row>

          {error && (
            <Row className="mb-3">
              <Col lg={12}>
                <Card className="border-danger">
                  <CardBody className="py-3">
                    <div className="alert alert-danger mb-0">
                      <i className="ri-error-warning-line me-2"></i>
                      <strong>Error Loading Properties:</strong>{" "}
                      {error?.message || "Failed to fetch properties"}
                      <br />
                      <small className="text-muted mt-2 d-block">
                        Ensure you are logged in and the backend is running.
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
          ) : safeProperties.length > 0 ? (
            <>
              <Row>
                {safeProperties.map((property: any) => {
                  const media = Array.isArray(property?.media)
                    ? property.media.filter(Boolean)
                    : [];
                  const coverUrl =
                    property.cover_image_url ||
                    media.find((m: any) => m?.isCover || m?.is_cover)?.url ||
                    media.find((m: any) => m?.public_url)?.public_url ||
                    media[0]?.url ||
                    media[0]?.public_url;

                  return (
                    <Col lg={4} md={6} key={property.id} className="mb-4">
                      <Card className="border shadow-sm h-100">
                        <CardBody className="p-0">
                          <img
                            src={coverUrl || propertyPlaceholder}
                            alt={property?.title || "Property"}
                            className="img-fluid rounded-top"
                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                          />

                          <div className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="mb-0" style={{ color: "#5B7E3C" }}>
                                {property?.title || "Untitled Property"}
                              </h5>
                              <Badge color={getStatusColor(property?.status)} pill>
                                {property?.status || "DRAFT"}
                              </Badge>
                            </div>

                            <h4 className="mb-2" style={{ color: "#C44545" }}>
                              ₱{Number(property?.price_php || 0).toLocaleString()}
                            </h4>

                            <p className="text-muted mb-2">
                              <i className="ri-map-pin-line me-1"></i>
                              {property?.address?.city_municipality || "N/A"},{" "}
                              {property?.address?.province || "N/A"}
                            </p>

                            {(property.bedrooms || property.bathrooms) && (
                              <div className="d-flex gap-3 mb-3">
                                {property.bedrooms != null && (
                                  <span className="text-muted">
                                    <i className="ri-hotel-bed-line me-1"></i>
                                    {property.bedrooms} Beds
                                  </span>
                                )}
                                {property.bathrooms != null && (
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
                                style={{ backgroundColor: "#5B7E3C", borderColor: "#5B7E3C" }}
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

              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-2 mb-4 flex-wrap">
                  <Button
                    color="light"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  {pageNumbers.map((n) => (
                    <Button
                      key={n}
                      size="sm"
                      color={n === page ? "primary" : "light"}
                      style={
                        n === page
                          ? { backgroundColor: "#A2CB8B", borderColor: "#A2CB8B" }
                          : undefined
                      }
                      disabled={loading}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </Button>
                  ))}
                  <Button
                    color="light"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody className="text-center py-5">
                    <i className="ri-home-4-line display-1 text-muted mb-3"></i>
                    <h4>
                      {statusFilter
                        ? "No properties match this filter"
                        : "No Properties Yet"}
                    </h4>
                    <p className="text-muted">
                      {statusFilter
                        ? "Try another status or clear the filter."
                        : "Create your first property listing to get started."}
                    </p>
                    <Button
                      color="success"
                      onClick={() => navigate("/properties/new")}
                      style={{ backgroundColor: "#A2CB8B", borderColor: "#A2CB8B" }}
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
