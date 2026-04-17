import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Spinner,
} from "reactstrap";
import { getPublicProperty } from "../../helpers/fakebackend_helper";
import propertyPlaceholder from "../../assets/images/property-placeholder.svg";

import "./PublicPropertyDetail.scss";

function safeMediaUrl(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const t = url.trim();
  return t.length > 0 ? t : null;
}

type MediaItem = {
  id: string;
  url: string;
  sort_order?: number;
  is_cover?: boolean;
};

type DetailPayload = {
  id: string;
  title: string;
  description?: string;
  price_php?: number;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  address?: {
    city_municipality?: string;
    province?: string;
    region?: string;
    barangay?: string;
    street_address?: string;
  };
  media?: MediaItem[];
  agent?: { name?: string; phone?: string; avatar_url?: string };
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

const PublicPropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const raw = await getPublicProperty(id);
        const payload = raw as unknown as DetailPayload;
        if (!cancelled) {
          setDetail(payload);
          setError(null);
          document.title = `${payload.title || "Listing"} | Browse`;
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Listing not found.");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const sortedMedia = [...(detail?.media || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const cover =
    safeMediaUrl(sortedMedia.find((m) => m.is_cover)?.url) ||
    safeMediaUrl(sortedMedia[0]?.url) ||
    null;

  return (
    <div className="public-home min-vh-100">
      <header className="public-home__header border-bottom">
        <Container fluid className="py-3">
          <Row className="align-items-center">
            <Col>
              <Link to="/" className="text-decoration-none text-body">
                ← Back to listings
              </Link>
            </Col>
            <Col xs="auto">
              <Button tag={Link} to="/login" color="primary" outline size="sm">
                Agent login
              </Button>
            </Col>
          </Row>
        </Container>
      </header>

      <Container className="py-4 pb-5">
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : error || !detail ? (
          <div className="alert alert-warning">{error || "Not found."}</div>
        ) : (
          <Row className="g-4">
            <Col lg={7}>
              <div className="public-detail__hero-wrap mb-2">
                <img
                  src={cover || propertyPlaceholder}
                  alt=""
                  className={`public-detail__hero-img ${
                    cover
                      ? "public-detail__hero-img--photo"
                      : "public-detail__hero-img--placeholder"
                  }`}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.dataset.placeholderApplied === "1") return;
                    el.dataset.placeholderApplied = "1";
                    el.src = propertyPlaceholder;
                    el.classList.remove("public-detail__hero-img--photo");
                    el.classList.add("public-detail__hero-img--placeholder");
                  }}
                />
              </div>
              {sortedMedia.length > 1 && (
                <Row className="g-2 mt-2">
                  {sortedMedia.slice(0, 6).map((m) => {
                    const thumbSrc = safeMediaUrl(m.url) || propertyPlaceholder;
                    const isPlaceholder = !safeMediaUrl(m.url);
                    return (
                      <Col key={m.id} xs={4}>
                        <img
                          src={thumbSrc}
                          alt=""
                          className={`public-detail__thumb img-fluid ${
                            isPlaceholder ? "public-detail__thumb--placeholder" : ""
                          }`}
                          onError={(e) => {
                            const el = e.currentTarget;
                            if (el.dataset.placeholderApplied === "1") return;
                            el.dataset.placeholderApplied = "1";
                            el.src = propertyPlaceholder;
                            el.classList.add("public-detail__thumb--placeholder");
                          }}
                        />
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Col>
            <Col lg={5}>
              <h1 className="h3 mb-2">{detail.title}</h1>
              <p className="text-primary fs-4 fw-semibold mb-3">
                {formatPhp(detail.price_php)}
              </p>
              <p className="text-muted small mb-3">
                {detail.property_type}
                {detail.bedrooms != null ? ` · ${detail.bedrooms} bed` : ""}
                {detail.bathrooms != null ? ` · ${detail.bathrooms} bath` : ""}
              </p>
              {detail.address && (
                <Card className="mb-3 border">
                  <CardBody className="py-3">
                    <h2 className="h6 text-muted mb-2">Location</h2>
                    <p className="mb-0 small">
                      {[
                        detail.address.street_address,
                        detail.address.barangay,
                        detail.address.city_municipality,
                        detail.address.province,
                        detail.address.region,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </CardBody>
                </Card>
              )}
              {detail.description && (
                <div className="mb-3">
                  <h2 className="h6 text-muted">Description</h2>
                  <p className="small mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {detail.description}
                  </p>
                </div>
              )}
              {detail.agent && (
                <Card className="border" style={{ borderColor: "#91C6BC" }}>
                  <CardBody>
                    <h2 className="h6 mb-2">Listed by</h2>
                    <p className="mb-1 fw-medium">{detail.agent.name}</p>
                    {detail.agent.phone && (
                      <p className="text-muted small mb-0">
                        <a href={`tel:${detail.agent.phone}`}>
                          {detail.agent.phone}
                        </a>
                      </p>
                    )}
                  </CardBody>
                </Card>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default PublicPropertyDetail;
