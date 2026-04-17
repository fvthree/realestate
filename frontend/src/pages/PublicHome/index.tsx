import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
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

type ListingFilters = {
  city: string;
  province: string;
  propertyType: string;
  bedrooms: string;
  minPrice: string;
  maxPrice: string;
};

const emptyFilters: ListingFilters = {
  city: "",
  province: "",
  propertyType: "",
  bedrooms: "",
  minPrice: "",
  maxPrice: "",
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
  const [perPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ListingFilters>(emptyFilters);

  const hasActiveFilters = useMemo(
    () => Object.values(appliedFilters).some((v) => String(v).trim().length > 0),
    [appliedFilters]
  );

  const load = useCallback(
    async (nextPage: number) => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page: nextPage,
          per_page: perPage,
        };
        if (appliedFilters.city) params.city = appliedFilters.city;
        if (appliedFilters.province) params.province = appliedFilters.province;
        if (appliedFilters.propertyType) params.property_type = appliedFilters.propertyType;
        if (appliedFilters.bedrooms) params.bedrooms = Number(appliedFilters.bedrooms);
        if (appliedFilters.minPrice) params.minPrice = Number(appliedFilters.minPrice);
        if (appliedFilters.maxPrice) params.maxPrice = Number(appliedFilters.maxPrice);
        const raw = await getPublicProperties({
          ...params,
        });
        const payload = raw as unknown as ListPayload;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const meta = payload?.meta;
        setTotal(typeof meta?.total === "number" ? meta.total : data.length);
        setItems(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Could not load listings.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, perPage]
  );

  useEffect(() => {
    document.title = "MyTahanan";
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);
  
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageNumbers = useMemo(() => {
    const numbers: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages]);

  return (
    <div className="public-home">
      <section className="public-home__hero bg-light py-5 mb-4">
        <Container>
          <h1 className="h3 mb-2">Find your next home</h1>
          <p className="text-muted mb-0">
            Browse active listings from verified agents. Sold and draft listings are not shown here.
          </p>
        </Container>
      </section>

      <Container className="pb-5">
        <Card className="border shadow-sm mb-4">
          <CardBody className="py-3">
            <Row className="g-3 align-items-end">
              <Col md={6} lg={3}>
                <Label className="form-label mb-1">City</Label>
                <Input
                  type="text"
                  placeholder="e.g. Imus"
                  value={filters.city}
                  onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                />
              </Col>
              <Col md={6} lg={3}>
                <Label className="form-label mb-1">Province</Label>
                <Input
                  type="text"
                  placeholder="e.g. Cavite"
                  value={filters.province}
                  onChange={(e) => setFilters((f) => ({ ...f, province: e.target.value }))}
                />
              </Col>
              <Col md={6} lg={2}>
                <Label className="form-label mb-1">Property type</Label>
                <Input
                  type="select"
                  value={filters.propertyType}
                  onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))}
                >
                  <option value="">Any</option>
                  <option value="HOUSE">House</option>
                  <option value="CONDO">Condo</option>
                  <option value="LOT">Lot</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="COMMERCIAL">Commercial</option>
                </Input>
              </Col>
              <Col md={6} lg={2}>
                <Label className="form-label mb-1">Bedrooms</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={filters.bedrooms}
                  onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value }))}
                />
              </Col>
              <Col md={6} lg={1}>
                <Label className="form-label mb-1">Min</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                />
              </Col>
              <Col md={6} lg={1}>
                <Label className="form-label mb-1">Max</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                />
              </Col>
            </Row>

            <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
              <Button
                color="primary"
                size="sm"
                style={{ backgroundColor: "#A2CB8B", borderColor: "#A2CB8B" }}
                onClick={() => {
                  setPage(1);
                  setAppliedFilters(filters);
                }}
              >
                <i className="ri-filter-3-line me-1" />
                Apply filters
              </Button>
              <Button
                color="light"
                size="sm"
                onClick={() => {
                  setPage(1);
                  setFilters(emptyFilters);
                  setAppliedFilters(emptyFilters);
                }}
              >
                Clear
              </Button>
              <span className="text-muted small ms-auto">
                {hasActiveFilters ? "Filtered results" : "Showing all published listings"}
              </span>
            </div>
          </CardBody>
        </Card>

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
            {hasActiveFilters
              ? "No listings match your filters. Try broadening your search."
              : "No published listings yet. Check back soon."}
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
                      <div className="mt-auto d-grid gap-2">
                        <Button
                          tag={Link}
                          to={`/listing/${p.id}`}
                          color="primary"
                          size="sm"
                          className="w-100"
                          style={{
                            backgroundColor: "#A2CB8B",
                            borderColor: "#A2CB8B",
                          }}
                        >
                          View details
                        </Button>
                        <Button
                          tag={Link}
                          to={`/listing/${p.id}?contact=1`}
                          color="primary"
                          outline
                          size="sm"
                          className="w-100"
                          style={{
                            borderColor: "#A2CB8B",
                            color: "#5B7E3C",
                          }}
                        >
                          <i className="ri-mail-send-line me-1" />
                          Message agent
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
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
        )}
      </Container>

      <footer className="public-home__footer border-top mt-auto">
        <Container fluid className="py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold text-body">MyTahanan</span>
              <span className="text-muted small d-none d-sm-inline">Philippines listings</span>
            </div>
            <div className="d-flex align-items-center gap-3 public-home__footer-links">
              <Link to="/pages-maintenance" className="text-muted small text-decoration-none">
                Privacy
              </Link>
              <Link to="/pages-maintenance" className="text-muted small text-decoration-none">
                Terms
              </Link>
              <Link to="/pages-maintenance" className="text-muted small text-decoration-none">
                Contact
              </Link>
            </div>
            <p className="text-muted small mb-0">
              Copyright © {new Date().getFullYear()} MyTahanan
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default PublicHome;
