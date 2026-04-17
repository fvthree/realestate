import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Spinner,
} from "reactstrap";
import { getPublicProperties } from "../../helpers/fakebackend_helper";
import propertyPlaceholder from "../../assets/images/property-placeholder.svg";

import "./PublicHome.scss";

type PublicPropertyItem = {
  id: string;
  title: string;
  status?: string;
  price_php?: number;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  cover_image_url?: string | null;
  address?: { city_municipality?: string; province?: string };
};

type ListPayload = {
  data: PublicPropertyItem[];
  meta: { page: number; per_page: number; total: number };
};

const formatPhp = (n: number | undefined) => {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return `₱${n}`;
  }
};

const PublicHome = () => {
  const [items, setItems] = useState<PublicPropertyItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        const raw = await getPublicProperties({
          page: nextPage,
          per_page: perPage,
        });
        const payload = raw as unknown as ListPayload;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const meta = payload?.meta;
        setTotal(typeof meta?.total === "number" ? meta.total : data.length);
        setItems((prev) => (append ? [...prev, ...data] : data));
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Could not load listings.");
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [perPage]
  );

  useEffect(() => {
    document.title = "Browse properties | Philippines";
    load(1, false);
  }, [load]);

  const hasMore = items.length < total;

  return (
    <div className="public-home">
      <header className="public-home__header border-bottom">
        <Container fluid className="py-3">
          <Row className="align-items-center">
            <Col>
              <Link to="/" className="public-home__brand text-decoration-none">
                <span className="fw-semibold fs-18 text-body">Seller Portal</span>
                <span className="text-muted ms-2 d-none d-sm-inline">
                  Philippines listings
                </span>
              </Link>
            </Col>
            <Col xs="auto" className="d-flex gap-2">
              <Button tag={Link} to="/login" color="primary" outline size="sm">
                Agent login
              </Button>
            </Col>
          </Row>
        </Container>
      </header>

      <section className="public-home__hero bg-light py-5 mb-4">
        <Container>
          <h1 className="h3 mb-2">Find your next home</h1>
          <p className="text-muted mb-0">
            Browse active listings from verified agents. Sold and draft listings are not shown here.
          </p>
        </Container>
      </section>

      <Container className="pb-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted text-center py-5">
            No published listings yet. Check back soon.
          </p>
        ) : (
          <>
            <Row className="g-4">
              {items.map((p) => (
                <Col key={p.id} md={6} lg={4}>
                  <Card className="h-100 shadow-sm border public-home__card">
                    <div className="public-home__thumb-wrap">
                      <img
                        src={p.cover_image_url || propertyPlaceholder}
                        alt=""
                        className={`public-home__thumb${!p.cover_image_url ? " public-home__thumb--fallback" : ""}`}
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget;
                          if (el.dataset.placeholderApplied === "1") return;
                          el.dataset.placeholderApplied = "1";
                          el.src = propertyPlaceholder;
                          el.classList.add("public-home__thumb--fallback");
                        }}
                      />
                    </div>
                    <CardBody className="d-flex flex-column">
                      <h2 className="h6 mb-2 text-truncate" title={p.title}>
                        {p.title}
                      </h2>
                      <p className="text-primary fw-semibold mb-2">
                        {formatPhp(p.price_php)}
                      </p>
                      <p className="text-muted small mb-3">
                        {[p.address?.city_municipality, p.address?.province]
                          .filter(Boolean)
                          .join(", ") || "Location on request"}
                      </p>
                      <div className="mt-auto">
                        <Button
                          tag={Link}
                          to={`/listing/${p.id}`}
                          color="primary"
                          size="sm"
                          className="w-100"
                          style={{
                            backgroundColor: "#91C6BC",
                            borderColor: "#91C6BC",
                          }}
                        >
                          View details
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            {hasMore && (
              <div className="text-center mt-4">
                <Button
                  color="secondary"
                  outline
                  disabled={loadingMore}
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    load(next, true);
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Loading…
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default PublicHome;
