import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { createInquiry } from "../../helpers/fakebackend_helper";

export type ContactAgentModalProps = {
  propertyId: string;
  propertyTitle?: string;
  agentDisplayName?: string;
  isOpen: boolean;
  toggle: () => void;
};

const ContactAgentModal = ({
  propertyId,
  propertyTitle,
  agentDisplayName,
  isOpen,
  toggle,
}: ContactAgentModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSuccess(false);
    setErrors({});
  }, [isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Enter a valid email address.";
    if (!phone.trim()) e.phone = "Please enter your mobile number.";
    else if (phone.trim().length < 7)
      e.phone = "Phone number looks too short.";
    if (!message.trim()) e.message = "Please enter a message.";
    else if (message.trim().length < 5)
      e.message = "Message is too short.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createInquiry(propertyId, {
        buyerName: name.trim(),
        buyerEmail: email.trim(),
        buyerPhone: phone.trim(),
        message: message.trim(),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setErrors({});
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Could not send your message. Please try again.";
      setErrors({ _form: String(msg) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered size="lg">
      <ModalHeader toggle={handleClose}>
        Message the agent
        {agentDisplayName ? (
          <span className="text-muted fw-normal fs-14 d-block mt-1">
            {agentDisplayName}
            {propertyTitle ? ` · ${propertyTitle}` : ""}
          </span>
        ) : propertyTitle ? (
          <span className="text-muted fw-normal fs-14 d-block mt-1">
            {propertyTitle}
          </span>
        ) : null}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {success ? (
            <Alert color="success" className="mb-0">
              Your message was sent. The listing agent will be notified and can
              reply using the contact details you provided.
            </Alert>
          ) : (
            <>
              {errors._form && (
                <Alert color="danger" className="py-2">
                  {errors._form}
                </Alert>
              )}
              <p className="text-muted small mb-3">
                No account needed. Your details are only shared with the agent
                for this inquiry.
              </p>
              <div className="mb-3">
                <Label className="form-label">Your name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  invalid={Boolean(errors.name)}
                  placeholder="Full name"
                  autoComplete="name"
                  disabled={submitting}
                />
                {errors.name && (
                  <FormFeedback type="invalid">{errors.name}</FormFeedback>
                )}
              </div>
              <div className="mb-3">
                <Label className="form-label">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={submitting}
                />
                {errors.email && (
                  <FormFeedback type="invalid">{errors.email}</FormFeedback>
                )}
              </div>
              <div className="mb-3">
                <Label className="form-label">Mobile number</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  invalid={Boolean(errors.phone)}
                  placeholder="+63 9xx xxx xxxx"
                  autoComplete="tel"
                  disabled={submitting}
                />
                {errors.phone && (
                  <FormFeedback type="invalid">{errors.phone}</FormFeedback>
                )}
              </div>
              <div className="mb-0">
                <Label className="form-label">Message</Label>
                <Input
                  type="textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  invalid={Boolean(errors.message)}
                  placeholder="Ask about viewing schedule, price, or other details…"
                  disabled={submitting}
                />
                {errors.message && (
                  <FormFeedback type="invalid">{errors.message}</FormFeedback>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-top">
          {success ? (
            <Button color="primary" type="button" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                color="light"
                type="button"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={submitting}
                style={{
                  backgroundColor: "#A2CB8B",
                  borderColor: "#A2CB8B",
                }}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
            </>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ContactAgentModal;
