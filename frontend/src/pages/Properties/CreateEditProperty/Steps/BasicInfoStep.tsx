import React from "react";
import { Row, Col, Label, Input, FormFeedback } from "reactstrap";
import { propertyTypes } from "../../../../common/data/philippineLocations";

interface BasicInfoStepProps {
  validation: any;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ validation }) => {
  return (
    <div>
      <h5 className="mb-3" style={{ color: '#5B7E3C' }}>Property Basic Information</h5>
      <p className="text-muted">Enter the basic details about your property</p>

      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <Label htmlFor="property-title" className="form-label">
              Property Title <span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              className="form-control"
              id="property-title"
              name="title"
              placeholder="e.g., Modern 3BR House in Cebu City"
              value={validation.values.title || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.title && validation.errors.title ? true : false}
            />
            {validation.touched.title && validation.errors.title ? (
              <FormFeedback type="invalid">{validation.errors.title}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="property-type" className="form-label">
              Property Type <span className="text-danger">*</span>
            </Label>
            <Input
              type="select"
              className="form-control"
              id="property-type"
              name="property_type"
              value={validation.values.property_type || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.property_type && validation.errors.property_type ? true : false}
            >
              <option value="">Select Type</option>
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Input>
            {validation.touched.property_type && validation.errors.property_type ? (
              <FormFeedback type="invalid">{validation.errors.property_type}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="property-price" className="form-label">
              Price (PHP) <span className="text-danger">*</span>
            </Label>
            <Input
              type="number"
              className="form-control"
              id="property-price"
              name="price_php"
              placeholder="e.g., 5000000"
              value={validation.values.price_php || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.price_php && validation.errors.price_php ? true : false}
            />
            {validation.touched.price_php && validation.errors.price_php ? (
              <FormFeedback type="invalid">{validation.errors.price_php}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="property-bedrooms" className="form-label">
              Bedrooms
            </Label>
            <Input
              type="number"
              className="form-control"
              id="property-bedrooms"
              name="bedrooms"
              placeholder="e.g., 3"
              min="0"
              value={validation.values.bedrooms || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.bedrooms && validation.errors.bedrooms ? true : false}
            />
            {validation.touched.bedrooms && validation.errors.bedrooms ? (
              <FormFeedback type="invalid">{validation.errors.bedrooms}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="property-bathrooms" className="form-label">
              Bathrooms
            </Label>
            <Input
              type="number"
              className="form-control"
              id="property-bathrooms"
              name="bathrooms"
              placeholder="e.g., 2"
              min="0"
              step="0.5"
              value={validation.values.bathrooms || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.bathrooms && validation.errors.bathrooms ? true : false}
            />
            {validation.touched.bathrooms && validation.errors.bathrooms ? (
              <FormFeedback type="invalid">{validation.errors.bathrooms}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="property-lotarea" className="form-label">
              Lot Area (sqm)
            </Label>
            <Input
              type="number"
              className="form-control"
              id="property-lotarea"
              name="lot_area_sqm"
              placeholder="e.g., 120"
              min="0"
              value={validation.values.lot_area_sqm || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.lot_area_sqm && validation.errors.lot_area_sqm ? true : false}
            />
            {validation.touched.lot_area_sqm && validation.errors.lot_area_sqm ? (
              <FormFeedback type="invalid">{validation.errors.lot_area_sqm}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="property-floorarea" className="form-label">
              Floor Area (sqm)
            </Label>
            <Input
              type="number"
              className="form-control"
              id="property-floorarea"
              name="floor_area_sqm"
              placeholder="e.g., 80"
              min="0"
              value={validation.values.floor_area_sqm || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.floor_area_sqm && validation.errors.floor_area_sqm ? true : false}
            />
            {validation.touched.floor_area_sqm && validation.errors.floor_area_sqm ? (
              <FormFeedback type="invalid">{validation.errors.floor_area_sqm}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={12}>
          <div className="mb-3">
            <Label htmlFor="property-description" className="form-label">
              Description
            </Label>
            <Input
              type="textarea"
              className="form-control"
              id="property-description"
              name="description"
              rows={5}
              placeholder="Describe your property, including features, amenities, and nearby landmarks..."
              value={validation.values.description || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.description && validation.errors.description ? true : false}
            />
            {validation.touched.description && validation.errors.description ? (
              <FormFeedback type="invalid">{validation.errors.description}</FormFeedback>
            ) : null}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BasicInfoStep;

