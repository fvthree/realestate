import React from "react";
import { Row, Col, Card, CardBody, Badge, Alert } from "reactstrap";
import { PropertyFormData } from "../../../../types/property";
import { propertyTypes } from "../../../../common/data/philippineLocations";

interface ReviewStepProps {
  formData: PropertyFormData;
  uploadedMedia: any[];
  canPublish: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, uploadedMedia, canPublish }) => {
  const propertyType = propertyTypes.find(t => t.value === formData.property_type);
  const safeMedia = uploadedMedia.filter(Boolean);
  const coverImage = safeMedia.find((m) => m?.isCover) || safeMedia[0];

  const validationChecklist = [
    {
      label: "Property title",
      valid: Boolean(formData.title),
      value: formData.title
    },
    {
      label: "Property type",
      valid: Boolean(formData.property_type),
      value: propertyType?.label
    },
    {
      label: "Price",
      valid: Boolean(formData.price_php),
      value: formData.price_php ? `₱${parseFloat(formData.price_php).toLocaleString()}` : null
    },
    {
      label: "Location (Region, Province, City)",
      valid: Boolean(formData.region && formData.province && formData.city),
      value: formData.city ? `${formData.city}, ${formData.province}, ${formData.region}` : null
    },
    {
      label: "At least 1 photo",
      valid: safeMedia.length > 0,
      value: `${safeMedia.length} photo(s) uploaded`
    }
  ];

  const missingFields = validationChecklist.filter(item => !item.valid);

  return (
    <div>
      <h5 className="mb-3" style={{ color: '#5B7E3C' }}>Review & Publish</h5>
      <p className="text-muted">Review your property details before publishing</p>

      <Row>
        {/* Validation Checklist */}
        <Col lg={12}>
          <Card className="border mb-4">
            <CardBody>
              <h6 className="mb-3">
                <i className="ri-checkbox-circle-line me-2" style={{ color: '#5B7E3C' }}></i>
                Required Fields Checklist
              </h6>

              {validationChecklist.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  {item.valid ? (
                    <i className="ri-checkbox-circle-fill me-2 text-success fs-5"></i>
                  ) : (
                    <i className="ri-checkbox-blank-circle-line me-2 text-muted fs-5"></i>
                  )}
                  <span className={item.valid ? "text-dark" : "text-muted"}>
                    {item.label}
                    {item.valid && item.value && (
                      <span className="text-muted ms-2">({item.value})</span>
                    )}
                  </span>
                </div>
              ))}

              {!canPublish && missingFields.length > 0 && (
                <Alert color="warning" className="mt-3 mb-0">
                  <i className="ri-error-warning-line me-2"></i>
                  Please complete the following required fields: <strong>{missingFields.map(f => f.label).join(', ')}</strong>
                </Alert>
              )}

              {canPublish && (
                <Alert color="success" className="mt-3 mb-0">
                  <i className="ri-checkbox-circle-fill me-2"></i>
                  All required fields are complete! You can now publish your property.
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Property Preview */}
        <Col lg={12}>
          <h6 className="mb-3">Property Preview</h6>
          <Card className="border shadow-sm">
            <CardBody className="p-0">
              {/* Cover Image */}
              {coverImage && (
                <div className="position-relative">
                  <img
                    src={coverImage.preview || coverImage.url}
                    alt={formData.title}
                    className="img-fluid rounded-top"
                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge
                      pill
                      style={{
                        backgroundColor: '#C44545',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      {propertyType?.label || formData.property_type}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="p-4">
                {/* Title and Price */}
                <div className="mb-3">
                  <h4 className="mb-2" style={{ color: '#5B7E3C' }}>
                    {formData.title || "Property Title"}
                  </h4>
                  <h3 className="mb-0" style={{ color: '#C44545' }}>
                    ₱{formData.price_php ? parseFloat(formData.price_php).toLocaleString() : '0'}
                  </h3>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <p className="text-muted mb-1">
                    <i className="ri-map-pin-line me-2"></i>
                    {formData.city && formData.province ? (
                      `${formData.barangay ? formData.barangay + ', ' : ''}${formData.city}, ${formData.province}`
                    ) : (
                      'Location not specified'
                    )}
                  </p>
                  {formData.street_address && (
                    <p className="text-muted small mb-0">
                      {formData.street_address}
                    </p>
                  )}
                </div>

                {/* Property Details */}
                <div className="d-flex flex-wrap gap-3 mb-3">
                  {formData.bedrooms && (
                    <div className="d-flex align-items-center">
                      <i className="ri-hotel-bed-line me-2" style={{ color: '#5B7E3C' }}></i>
                      <span>{formData.bedrooms} Bed{parseInt(formData.bedrooms) !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {formData.bathrooms && (
                    <div className="d-flex align-items-center">
                      <i className="ri-drop-line me-2" style={{ color: '#5B7E3C' }}></i>
                      <span>{formData.bathrooms} Bath{parseFloat(formData.bathrooms) !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {formData.lot_area_sqm && (
                    <div className="d-flex align-items-center">
                      <i className="ri-ruler-line me-2" style={{ color: '#5B7E3C' }}></i>
                      <span>{formData.lot_area_sqm} sqm (Lot)</span>
                    </div>
                  )}
                  {formData.floor_area_sqm && (
                    <div className="d-flex align-items-center">
                      <i className="ri-home-4-line me-2" style={{ color: '#5B7E3C' }}></i>
                      <span>{formData.floor_area_sqm} sqm (Floor)</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {formData.description && (
                  <div className="mb-3">
                    <h6 className="mb-2">Description</h6>
                    <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                      {formData.description}
                    </p>
                  </div>
                )}

                {/* Photo Gallery Preview */}
                {safeMedia.length > 1 && (
                  <div>
                    <h6 className="mb-2">Photos ({safeMedia.length})</h6>
                    <div className="d-flex gap-2 flex-wrap">
                      {safeMedia.slice(0, 4).map((media, index) => (
                        <img
                          key={media?.id || index}
                          src={media?.preview || media?.url || ""}
                          alt={`Property ${index + 1}`}
                          className="rounded"
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            border: media?.isCover ? '3px solid #C44545' : 'none'
                          }}
                        />
                      ))}
                      {safeMedia.length > 4 && (
                        <div
                          className="d-flex align-items-center justify-content-center rounded bg-light"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <span className="text-muted">+{safeMedia.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>

        {!canPublish && (
          <Col lg={12}>
            <Alert color="info" className="mt-3">
              <i className="ri-information-line me-2"></i>
              You can save this as a draft and continue editing later. To publish, please complete all required fields.
            </Alert>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ReviewStep;

