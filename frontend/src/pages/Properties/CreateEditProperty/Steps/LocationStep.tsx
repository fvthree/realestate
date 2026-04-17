import React, { useState, useEffect } from "react";
import { Row, Col, Label, Input, FormFeedback } from "reactstrap";
import {
  regions,
  provincesByRegion,
  citiesByProvince,
  barangaysByCity
} from "../../../../common/data/philippineLocations";

interface LocationStepProps {
  validation: any;
}

const LocationStep: React.FC<LocationStepProps> = ({ validation }) => {
  const [availableProvinces, setAvailableProvinces] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [availableBarangays, setAvailableBarangays] = useState<any[]>([]);

  // Update provinces when region changes
  useEffect(() => {
    if (validation.values.region) {
      const provinces = provincesByRegion[validation.values.region] || [];
      setAvailableProvinces(provinces);

      // Reset dependent fields if region changed
      if (!provinces.find((p: any) => p.code === validation.values.province)) {
        validation.setFieldValue('province', '');
        validation.setFieldValue('city', '');
        validation.setFieldValue('barangay', '');
      }
    } else {
      setAvailableProvinces([]);
      setAvailableCities([]);
      setAvailableBarangays([]);
    }
  }, [validation.values.region]);

  // Update cities when province changes
  useEffect(() => {
    if (validation.values.province) {
      const cities = citiesByProvince[validation.values.province] || [];
      setAvailableCities(cities);

      // Reset dependent fields if province changed
      if (!cities.find((c: any) => c.code === validation.values.city)) {
        validation.setFieldValue('city', '');
        validation.setFieldValue('barangay', '');
      }
    } else {
      setAvailableCities([]);
      setAvailableBarangays([]);
    }
  }, [validation.values.province]);

  // Update barangays when city changes
  useEffect(() => {
    if (validation.values.city) {
      const barangays = barangaysByCity[validation.values.city] || [];
      setAvailableBarangays(barangays);

      // Reset barangay if city changed
      if (!barangays.find((b: any) => b.code === validation.values.barangay)) {
        validation.setFieldValue('barangay', '');
      }
    } else {
      setAvailableBarangays([]);
    }
  }, [validation.values.city]);

  return (
    <div>
      <h5 className="mb-3" style={{ color: '#5B7E3C' }}>Property Location</h5>
      <p className="text-muted">Specify where the property is located</p>

      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-region" className="form-label">
              Region <span className="text-danger">*</span>
            </Label>
            <Input
              type="select"
              className="form-control"
              id="location-region"
              name="region"
              value={validation.values.region || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.region && validation.errors.region ? true : false}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </Input>
            {validation.touched.region && validation.errors.region ? (
              <FormFeedback type="invalid">{validation.errors.region}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-province" className="form-label">
              Province/City <span className="text-danger">*</span>
            </Label>
            <Input
              type="select"
              className="form-control"
              id="location-province"
              name="province"
              value={validation.values.province || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              disabled={!validation.values.region}
              invalid={validation.touched.province && validation.errors.province ? true : false}
            >
              <option value="">Select Province/City</option>
              {availableProvinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </Input>
            {validation.touched.province && validation.errors.province ? (
              <FormFeedback type="invalid">{validation.errors.province}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-city" className="form-label">
              City/Municipality <span className="text-danger">*</span>
            </Label>
            <Input
              type="select"
              className="form-control"
              id="location-city"
              name="city"
              value={validation.values.city || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              disabled={!validation.values.province}
              invalid={validation.touched.city && validation.errors.city ? true : false}
            >
              <option value="">Select City/Municipality</option>
              {availableCities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </Input>
            {validation.touched.city && validation.errors.city ? (
              <FormFeedback type="invalid">{validation.errors.city}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-barangay" className="form-label">
              Barangay
            </Label>
            <Input
              type="select"
              className="form-control"
              id="location-barangay"
              name="barangay"
              value={validation.values.barangay || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              disabled={!validation.values.city}
              invalid={validation.touched.barangay && validation.errors.barangay ? true : false}
            >
              <option value="">Select Barangay</option>
              {availableBarangays.map((barangay) => (
                <option key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </option>
              ))}
            </Input>
            {validation.touched.barangay && validation.errors.barangay ? (
              <FormFeedback type="invalid">{validation.errors.barangay}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={12}>
          <div className="mb-3">
            <Label htmlFor="location-street" className="form-label">
              Street Address
            </Label>
            <Input
              type="text"
              className="form-control"
              id="location-street"
              name="street_address"
              placeholder="e.g., 123 Main Street, Subdivision Name"
              value={validation.values.street_address || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.street_address && validation.errors.street_address ? true : false}
            />
            {validation.touched.street_address && validation.errors.street_address ? (
              <FormFeedback type="invalid">{validation.errors.street_address}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-postal" className="form-label">
              Postal Code
            </Label>
            <Input
              type="text"
              className="form-control"
              id="location-postal"
              name="postal_code"
              placeholder="e.g., 6000"
              value={validation.values.postal_code || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={validation.touched.postal_code && validation.errors.postal_code ? true : false}
            />
            {validation.touched.postal_code && validation.errors.postal_code ? (
              <FormFeedback type="invalid">{validation.errors.postal_code}</FormFeedback>
            ) : null}
          </div>
        </Col>

        <Col lg={12}>
          <div className="alert alert-info" role="alert">
            <i className="ri-information-line me-2"></i>
            <strong>Note:</strong> Precise location coordinates can be added in the next updates. For now, provide accurate address details.
          </div>
        </Col>

        {/* Optional: Latitude and Longitude fields */}
        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-latitude" className="form-label">
              Latitude (Optional)
            </Label>
            <Input
              type="number"
              className="form-control"
              id="location-latitude"
              name="latitude"
              placeholder="e.g., 10.3157"
              step="any"
              value={validation.values.latitude || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
            />
          </div>
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            <Label htmlFor="location-longitude" className="form-label">
              Longitude (Optional)
            </Label>
            <Input
              type="number"
              className="form-control"
              id="location-longitude"
              name="longitude"
              placeholder="e.g., 123.8854"
              step="any"
              value={validation.values.longitude || ""}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LocationStep;

