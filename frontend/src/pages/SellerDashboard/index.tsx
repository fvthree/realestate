import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { getPropertyStatusCounts } from "../../helpers/fakebackend_helper";

export interface PropertyStatusCounts {
  draft: number;
  published: number;
  sold: number;
  archived: number;
  total: number;
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<PropertyStatusCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | Agent Dashboard";
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // api.get is typed as AxiosResponse but interceptors return response.data
        const data = (await getPropertyStatusCounts()) as unknown as PropertyStatusCounts;
        if (!cancelled) {
          setCounts(data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load property statistics");
          setCounts(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles: {
    key: keyof PropertyStatusCounts;
    label: string;
    accent: string;
    textClass: string;
  }[] = [
    { key: "draft", label: "Draft", accent: "#6c757d", textClass: "text-secondary" },
    { key: "published", label: "Published", accent: "#198754", textClass: "text-success" },
    { key: "sold", label: "Sold", accent: "#0d6efd", textClass: "text-primary" },
    { key: "archived", label: "Archived", accent: "#212529", textClass: "text-dark" },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="Seller Portal" />

          <Row className="mb-3">
            <Col lg={12}>
              <p className="text-muted mb-0">
                Overview of your listings by status.{" "}
                <button
                  type="button"
                  className="btn btn-link p-0 align-baseline"
                  onClick={() => navigate("/properties")}
                >
                  Manage properties
                </button>
              </p>
            </Col>
          </Row>

          {error && (
            <Row className="mb-3">
              <Col lg={12}>
                <div className="alert alert-danger mb-0" role="alert">
                  {error}
                </div>
              </Col>
            </Row>
          )}

          {loading ? (
            <Row>
              <Col className="d-flex justify-content-center py-5">
                <Spinner color="primary" />
              </Col>
            </Row>
          ) : counts ? (
            <>
              <Row className="g-3">
                {tiles.map(({ key, label, accent, textClass }) => (
                  <Col key={key} md={6} xl={3}>
                    <Card
                      className="border shadow-none h-100 cursor-pointer"
                      onClick={() => navigate("/properties")}
                      style={{ borderLeft: `4px solid ${accent}` }}
                    >
                      <CardBody>
                        <p className="text-uppercase text-muted fs-12 mb-1">{label}</p>
                        <h3 className={`mb-0 ${textClass}`}>{counts[key]}</h3>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Row className="mt-3">
                <Col md={6} xl={4}>
                  <Card
                    className="border shadow-none"
                    style={{ borderLeft: "4px solid #91C6BC" }}
                  >
                    <CardBody className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <p className="text-uppercase text-muted fs-12 mb-1">Total properties</p>
                        <h3 className="mb-0" style={{ color: "#2c5f57" }}>
                          {counts.total}
                        </h3>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ backgroundColor: "#91C6BC", borderColor: "#91C6BC", color: "#fff" }}
                        onClick={() => navigate("/properties")}
                      >
                        <i className="ri-building-2-line me-1"></i>
                        View all
                      </button>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          ) : null}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SellerDashboard;
