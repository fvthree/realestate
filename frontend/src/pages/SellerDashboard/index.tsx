import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, CardBody, Col, Container, Input, Label, Row, Spinner } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import InquiryThreadModal from "../../Components/Agent/InquiryThreadModal";
import { getAgentInquiries, getPropertyStatusCounts, updateAgentInquiry } from "../../helpers/fakebackend_helper";
import propertyPlaceholder from "../../assets/images/property-placeholder.svg";

import "./SellerDashboard.scss";

export interface PropertyStatusCounts {
  draft: number;
  published: number;
  sold: number;
  archived: number;
  total: number;
}

type InboxItem = {
  id: string;
  property_id: string;
  status: string;
  buyer_name?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  created_at?: string;
  property_title?: string | null;
  cover_image_url?: string | null;
};
type InboxMeta = {
  page?: number;
  per_page?: number;
  total?: number;
};

function buyerAvatarUrl(name: string | null | undefined): string {
  const n = (name || "Buyer").trim() || "Buyer";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&size=64&background=A2CB8B&color=fff&bold=true`;
}

function statusBadgeColor(status: string): string {
  switch (status?.toUpperCase()) {
    case "NEW":
      return "success";
    case "CONTACTED":
      return "info";
    case "QUALIFIED":
      return "primary";
    case "CLOSED":
      return "secondary";
    default:
      return "light";
  }
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<PropertyStatusCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [inboxMeta, setInboxMeta] = useState<InboxMeta>({});
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [threadInquiryId, setThreadInquiryId] = useState<string | null>(null);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, string>>({});
  const [savingStatusById, setSavingStatusById] = useState<Record<string, boolean>>({});
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxStatusFilter, setInboxStatusFilter] = useState<string>("");
  const inboxPerPage = 6;

  useEffect(() => {
    document.title = "Dashboard | Agent Dashboard";
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setInboxLoading(true);
        const raw = await getAgentInquiries({
          page: inboxPage,
          per_page: inboxPerPage,
          status: inboxStatusFilter || undefined,
        });
        const payload = raw as unknown as { data?: InboxItem[]; meta?: InboxMeta };
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        if (!cancelled) {
          setInbox(rows);
          setDraftStatuses((prev) => {
            const next = { ...prev };
            rows.forEach((r) => {
              next[r.id] = r.status || "NEW";
            });
            return next;
          });
          setInboxMeta(payload?.meta || {});
          setInboxError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setInboxError(e?.message || "Could not load conversations");
          setInbox([]);
          setInboxMeta({});
        }
      } finally {
        if (!cancelled) setInboxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inboxPage, inboxStatusFilter]);

  const inboxTotal = Number(inboxMeta?.total || 0);
  const inboxTotalPages = Math.max(1, Math.ceil(inboxTotal / inboxPerPage));
  const inboxPageNumbers = useMemo(() => {
    const nums: number[] = [];
    for (let n = 1; n <= inboxTotalPages; n++) nums.push(n);
    return nums;
  }, [inboxTotalPages]);

  const handleUpdateStatus = async (item: InboxItem) => {
    const nextStatus = (draftStatuses[item.id] || item.status || "").toUpperCase();
    if (!nextStatus || nextStatus === item.status) return;
    setSavingStatusById((s) => ({ ...s, [item.id]: true }));
    try {
      await updateAgentInquiry(item.id, { status: nextStatus });
      setInbox((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x))
      );
      if (inboxStatusFilter && nextStatus !== inboxStatusFilter) {
        setInboxPage(1);
      }
    } catch (e: any) {
      setInboxError(e?.message || "Could not update conversation status");
      setDraftStatuses((s) => ({ ...s, [item.id]: item.status }));
    } finally {
      setSavingStatusById((s) => ({ ...s, [item.id]: false }));
    }
  };

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
                    style={{ borderLeft: "4px solid #A2CB8B" }}
                  >
                    <CardBody className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <p className="text-uppercase text-muted fs-12 mb-1">Total properties</p>
                        <h3 className="mb-0" style={{ color: "#5B7E3C" }}>
                          {counts.total}
                        </h3>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ backgroundColor: "#A2CB8B", borderColor: "#A2CB8B", color: "#fff" }}
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

          <Row className="mt-4">
            <Col lg={12}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h5 className="mb-0">Recent conversations</h5>
                <span className="text-muted small">Buyer leads & property context</span>
              </div>
              <Card className="border shadow-none mb-3">
                <CardBody className="py-3">
                  <Row className="g-2 align-items-end">
                    <Col sm={6} md={4}>
                      <Label className="form-label mb-1">Filter by status</Label>
                      <Input
                        type="select"
                        value={inboxStatusFilter}
                        onChange={(e) => {
                          setInboxPage(1);
                          setInboxStatusFilter(e.target.value);
                        }}
                      >
                        <option value="">All</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="CLOSED">Closed</option>
                      </Input>
                    </Col>
                    <Col sm={6} md={8}>
                      <div className="text-muted small">
                        Showing {inbox.length} of {inboxTotal} conversations
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {inboxError && (
                <div className="alert alert-warning py-2 mb-3" role="alert">
                  {inboxError}
                </div>
              )}

              {inboxLoading ? (
                <div className="d-flex justify-content-center py-4">
                  <Spinner color="primary" />
                </div>
              ) : inbox.length === 0 ? (
                <Card className="border shadow-none">
                  <CardBody className="text-muted text-center py-4">
                    No inquiries yet. When buyers message you from a listing, they will appear here with
                    photos.
                  </CardBody>
                </Card>
              ) : (
                <div className="seller-dashboard d-flex flex-column gap-2">
                  {inbox.map((item) => (
                    <Card key={item.id} className="border shadow-none">
                      <CardBody className="py-3">
                        <div className="d-flex gap-3 align-items-start">
                          <div className="seller-dashboard__conversation-thumb">
                            <img
                              src={item.cover_image_url || propertyPlaceholder}
                              alt=""
                              className={`seller-dashboard__conversation-thumb-img${
                                !item.cover_image_url ? " seller-dashboard__conversation-thumb-img--fallback" : ""
                              }`}
                              loading="lazy"
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (el.dataset.placeholderApplied === "1") return;
                                el.dataset.placeholderApplied = "1";
                                el.src = propertyPlaceholder;
                                el.classList.add("seller-dashboard__conversation-thumb-img--fallback");
                              }}
                            />
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-start gap-2 flex-wrap">
                              <img
                                className="seller-dashboard__buyer-avatar"
                                src={buyerAvatarUrl(item.buyer_name)}
                                alt=""
                                loading="lazy"
                              />
                              <div className="flex-grow-1 min-w-0">
                                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                  <span className="fw-semibold text-truncate">
                                    {item.buyer_name || "Buyer"}
                                  </span>
                                  <Badge color={statusBadgeColor(item.status)} className="text-uppercase">
                                    {item.status || "—"}
                                  </Badge>
                                </div>
                                <div className="text-muted small text-truncate mb-0" title={item.property_title || undefined}>
                                  {item.property_title || "Property"}
                                </div>
                                {item.buyer_email && (
                                  <div className="text-muted small text-truncate">{item.buyer_email}</div>
                                )}
                                <div className="d-flex gap-2 align-items-center flex-wrap mt-2">
                                  <Input
                                    type="select"
                                    bsSize="sm"
                                    style={{ maxWidth: 170 }}
                                    value={draftStatuses[item.id] || item.status || "NEW"}
                                    onChange={(e) =>
                                      setDraftStatuses((s) => ({ ...s, [item.id]: e.target.value }))
                                    }
                                    disabled={Boolean(savingStatusById[item.id])}
                                  >
                                    <option value="NEW">NEW</option>
                                    <option value="CONTACTED">CONTACTED</option>
                                    <option value="QUALIFIED">QUALIFIED</option>
                                    <option value="CLOSED">CLOSED</option>
                                  </Input>
                                  <Button
                                    type="button"
                                    color="success"
                                    size="sm"
                                    disabled={
                                      Boolean(savingStatusById[item.id]) ||
                                      (draftStatuses[item.id] || item.status) === item.status
                                    }
                                    onClick={() => handleUpdateStatus(item)}
                                    style={{ backgroundColor: "#5B7E3C", borderColor: "#5B7E3C" }}
                                  >
                                    {savingStatusById[item.id] ? "Saving..." : "Update status"}
                                  </Button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    style={{ borderColor: "#A2CB8B", color: "#5B7E3C" }}
                                    onClick={() => setThreadInquiryId(item.id)}
                                  >
                                    <i className="ri-chat-3-line me-1" />
                                    View all messages
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                  {inboxTotalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-2 flex-wrap">
                      <Button
                        color="light"
                        size="sm"
                        disabled={inboxPage <= 1 || inboxLoading}
                        onClick={() => setInboxPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      {inboxPageNumbers.map((n) => (
                        <Button
                          key={n}
                          size="sm"
                          color={n === inboxPage ? "primary" : "light"}
                          style={n === inboxPage ? { backgroundColor: "#A2CB8B", borderColor: "#A2CB8B" } : undefined}
                          disabled={inboxLoading}
                          onClick={() => setInboxPage(n)}
                        >
                          {n}
                        </Button>
                      ))}
                      <Button
                        color="light"
                        size="sm"
                        disabled={inboxPage >= inboxTotalPages || inboxLoading}
                        onClick={() => setInboxPage((p) => Math.min(inboxTotalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </Container>
        <InquiryThreadModal
          inquiryId={threadInquiryId}
          isOpen={threadInquiryId !== null}
          toggle={() => setThreadInquiryId(null)}
        />
      </div>
    </React.Fragment>
  );
};

export default SellerDashboard;
