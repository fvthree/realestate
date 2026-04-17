import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { getAgentInquiry } from "../../helpers/fakebackend_helper";
import propertyPlaceholder from "../../assets/images/property-placeholder.svg";

import "./InquiryThreadModal.scss";

export type ThreadMessage = {
  id: string;
  sender_type: string;
  body: string;
  created_at?: string;
};

export type ThreadDetail = {
  id: string;
  property_id: string;
  status: string;
  property_title?: string | null;
  cover_image_url?: string | null;
  price_php?: number;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  city_municipality?: string | null;
  province?: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  messages?: ThreadMessage[];
};

function formatWhen(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatPhp(value: number | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `₱${value}`;
  }
}

type Props = {
  inquiryId: string | null;
  isOpen: boolean;
  toggle: () => void;
};

const InquiryThreadModal = ({ inquiryId, isOpen, toggle }: Props) => {
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !inquiryId) {
      setDetail(null);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await getAgentInquiry(inquiryId);
        const payload = raw as unknown as ThreadDetail;
        if (!cancelled) {
          setDetail(payload);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || e?.data?.message || "Could not load conversation");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, inquiryId]);

  const messages = Array.isArray(detail?.messages) ? detail.messages : [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable>
      <ModalHeader toggle={toggle}>Conversation</ModalHeader>
      <ModalBody className="pt-2">
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : error ? (
          <div className="alert alert-danger mb-0" role="alert">
            {error}
          </div>
        ) : detail ? (
          <>
            <div className="inquiry-thread__header d-flex gap-3 mb-4 pb-3 border-bottom">
              <div className="inquiry-thread__thumb flex-shrink-0">
                <img
                  src={detail.cover_image_url || propertyPlaceholder}
                  alt=""
                  className={`inquiry-thread__thumb-img${
                    !detail.cover_image_url ? " inquiry-thread__thumb-img--fallback" : ""
                  }`}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.dataset.placeholderApplied === "1") return;
                    el.dataset.placeholderApplied = "1";
                    el.src = propertyPlaceholder;
                    el.classList.add("inquiry-thread__thumb-img--fallback");
                  }}
                />
              </div>
              <div className="inquiry-thread__meta min-w-0">
                <div className="inquiry-thread__title fw-semibold text-truncate">
                  {detail.property_title || "Listing"}
                </div>
                <div className="inquiry-thread__specs text-muted">
                  {detail.property_type || "Property"}
                  {detail.bedrooms != null ? ` · ${detail.bedrooms} bed` : ""}
                  {detail.bathrooms != null ? ` · ${detail.bathrooms} bath` : ""}
                </div>
                <div className="inquiry-thread__price fw-semibold text-body">
                  {formatPhp(detail.price_php)}
                </div>
                <div className="inquiry-thread__location text-muted text-truncate">
                  {[detail.city_municipality, detail.province].filter(Boolean).join(", ") || "Location not provided"}
                </div>
                <div className="inquiry-thread__buyer text-muted">
                  {detail.buyer_name || "Buyer"}
                  {detail.buyer_phone ? ` · ${detail.buyer_phone}` : ""}
                </div>
                {detail.buyer_email && (
                  <div className="inquiry-thread__buyer text-muted text-truncate">{detail.buyer_email}</div>
                )}
              </div>
            </div>

            {messages.length === 0 ? (
              <p className="text-muted mb-0">No messages in this thread.</p>
            ) : (
              <ul className="list-unstyled mb-0 inquiry-thread__messages">
                {messages.map((m) => {
                  const isBuyer = (m.sender_type || "").toUpperCase() === "BUYER";
                  return (
                    <li
                      key={m.id}
                      className={`inquiry-thread__msg mb-3 ${isBuyer ? "inquiry-thread__msg--buyer" : "inquiry-thread__msg--agent"}`}
                    >
                      <div className="inquiry-thread__msg-meta text-muted mb-1">
                        {isBuyer ? "Buyer" : "You"}{" "}
                        <span className="text-body-secondary">· {formatWhen(m.created_at)}</span>
                      </div>
                      <div className="inquiry-thread__msg-body rounded p-3">{m.body}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline type="button" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InquiryThreadModal;
