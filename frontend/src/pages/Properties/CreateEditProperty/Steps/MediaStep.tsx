import React from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import Dropzone from "react-dropzone";
import { uploadPropertyMedia, deletePropertyMedia, reorderPropertyMedia } from "../../../../slices/properties/thunk";

interface MediaStepProps {
  uploadedMedia: any[];
  setUploadedMedia: React.Dispatch<React.SetStateAction<any[]>>;
  propertyId?: string;
}

const MediaStep: React.FC<MediaStepProps> = ({ uploadedMedia, setUploadedMedia, propertyId }) => {
  const dispatch = useDispatch<any>();
  const isCoverMedia = (media: any) => Boolean(media?.isCover ?? media?.is_cover);
  const [dropError, setDropError] = React.useState<string | null>(null);

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  async function handleAcceptedFiles(files: any) {
    setDropError(null);
    const newFiles = files.map((file: any, idx: number) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
        id: `temp-${Date.now()}-${idx}`,
        // Mark first media as cover if list is currently empty
        isCover: uploadedMedia.length === 0 && idx === 0,
      })
    );

    setUploadedMedia([...uploadedMedia, ...newFiles]);

    // If property exists, upload the real files immediately via multipart/form-data.
    if (propertyId) {
      const existingCount = uploadedMedia.length;
      const uploadedServerMedia: any[] = [];

      for (let idx = 0; idx < newFiles.length; idx += 1) {
        const file = newFiles[idx];
        try {
          const uploaded = await dispatch(uploadPropertyMedia({
            id: propertyId,
            file,
            isCover: existingCount === 0 && idx === 0,
          })).unwrap();

          uploadedServerMedia.push({
            ...uploaded,
            id: uploaded.id,
            isCover: uploaded.is_cover,
            is_cover: uploaded.is_cover,
            url: uploaded.public_url,
            preview: uploaded.public_url,
            name: file.name,
            size: file.size,
            formattedSize: formatBytes(file.size),
          });
        } catch (error) {
          console.error("Failed to upload media file:", error);
          setDropError("One or more images failed to upload. You can still save and re-upload from edit page.");
        }
      }

      if (uploadedServerMedia.length > 0) {
        setUploadedMedia((prev) => {
          const prevSafe = prev.filter(Boolean);
          const withoutTemp = prevSafe.filter((item: any) => !newFiles.some((temp: any) => temp.id === item.id));
          return [...withoutTemp, ...uploadedServerMedia];
        });
      }
    }
  }

  const handleSetCover = (index: number) => {
    const updatedMedia = uploadedMedia.filter(Boolean).map((media, i) => ({
      ...media,
      isCover: i === index,
      is_cover: i === index,
    }));
    setUploadedMedia(updatedMedia);

    // Update on server if property exists
    if (propertyId) {
      updatedMedia.forEach((media: any, orderIndex: number) => {
        if (!media?.id || String(media.id).startsWith("temp-")) {
          return;
        }
        dispatch(reorderPropertyMedia({
          propertyId,
          mediaId: media.id,
          payload: {
            sort_order: orderIndex,
            is_cover: media.isCover,
          },
        }));
      });
    }
  };

  const handleDeleteMedia = (index: number) => {
    const safeMedia = uploadedMedia.filter(Boolean);
    const mediaToDelete = safeMedia[index];
    if (!mediaToDelete) {
      console.error("Media to delete is undefined at index:", index);
      return;
    }

    const updatedMedia = safeMedia.filter((_, i) => i !== index);

    // If deleted media was cover, make first image the new cover
    if (isCoverMedia(mediaToDelete) && updatedMedia.length > 0) {
      updatedMedia[0] = { ...updatedMedia[0], isCover: true };
    }

    setUploadedMedia(updatedMedia);

    // Delete on server if property exists and media has a server ID
    if (propertyId && mediaToDelete.id && !String(mediaToDelete.id).startsWith("temp-")) {
      dispatch(deletePropertyMedia({ propertyId, mediaId: mediaToDelete.id }));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedMedia = uploadedMedia.filter(Boolean);
    [updatedMedia[index - 1], updatedMedia[index]] = [updatedMedia[index], updatedMedia[index - 1]];
    setUploadedMedia(updatedMedia);

    // Update order on server
    if (propertyId) {
      updatedMedia.forEach((media: any, orderIndex: number) => {
        if (!media?.id || String(media.id).startsWith("temp-")) {
          return;
        }
        dispatch(reorderPropertyMedia({
          propertyId,
          mediaId: media.id,
          payload: {
            sort_order: orderIndex,
            is_cover: media.isCover,
          },
        }));
      });
    }
  };

  const handleMoveDown = (index: number) => {
    const safeMedia = uploadedMedia.filter(Boolean);
    if (index === safeMedia.length - 1) return;
    const updatedMedia = safeMedia;
    [updatedMedia[index], updatedMedia[index + 1]] = [updatedMedia[index + 1], updatedMedia[index]];
    setUploadedMedia(updatedMedia);

    // Update order on server
    if (propertyId) {
      updatedMedia.forEach((media: any, orderIndex: number) => {
        if (!media?.id || String(media.id).startsWith("temp-")) {
          return;
        }
        dispatch(reorderPropertyMedia({
          propertyId,
          mediaId: media.id,
          payload: {
            sort_order: orderIndex,
            is_cover: media.isCover,
          },
        }));
      });
    }
  };

  // Single source of truth for display and actions
  const allMedia = uploadedMedia.filter(Boolean);

  return (
    <div>
      <h5 className="mb-3" style={{ color: '#5B7E3C' }}>Property Photos</h5>
      <p className="text-muted">Upload high-quality photos of your property. First photo will be the cover image.</p>

      <Row>
        <Col lg={12}>
          <div className="mb-4">
            <Dropzone
              onDrop={(acceptedFiles: any) => {
                handleAcceptedFiles(acceptedFiles);
              }}
              onDropRejected={(fileRejections) => {
                if (!fileRejections.length) return;
                const firstError = fileRejections[0].errors?.[0]?.message || "Some files were rejected.";
                setDropError(firstError);
              }}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.heic', '.heif', '.jfif']
              }}
              maxSize={10485760} // 10MB
            >
              {({ getRootProps, getInputProps }) => (
                <div className="dropzone dz-clickable" style={{ border: '2px dashed #A2CB8B' }}>
                  <div className="dz-message needsclick" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className="mb-3">
                      <i className="display-4 text-muted ri-upload-cloud-2-fill" style={{ color: '#5B7E3C' }} />
                    </div>
                    <h4 style={{ color: '#5B7E3C' }}>Drop images here or click to upload</h4>
                    <p className="text-muted">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WEBP</p>
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        </Col>

        {allMedia.length > 0 && (
          <Col lg={12}>
            <h6 className="mb-3">Uploaded Photos ({allMedia.length})</h6>
            <Row>
              {allMedia.map((file: any, index: number) => (
                <Col lg={3} md={4} sm={6} key={file.id || index} className="mb-3">
                  <Card className="border shadow-sm">
                    <CardBody className="p-2">
                      <div className="position-relative">
                        <img
                          data-dz-thumbnail=""
                          className="img-thumbnail rounded"
                          alt={file?.name || file?.filename || `media-${index}`}
                          src={file?.preview || file?.url || ""}
                          style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />

                        {isCoverMedia(file) && (
                          <div
                            className="position-absolute top-0 start-0 m-2 badge"
                            style={{ backgroundColor: '#C44545' }}
                          >
                            <i className="ri-image-line me-1"></i>Cover
                          </div>
                        )}

                        <div className="position-absolute top-0 end-0 m-2">
                          <Button
                            color="danger"
                            size="sm"
                            className="btn-icon"
                            onClick={() => handleDeleteMedia(index)}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <small className="text-muted d-block text-truncate">
                          {file?.name || file?.filename || 'Unnamed file'}
                        </small>
                        <small className="text-muted">
                          {file.formattedSize || formatBytes(file.size || 0)}
                        </small>
                      </div>

                      <div className="mt-2 d-flex gap-1">
                        {!isCoverMedia(file) && (
                          <Button
                            color="success"
                            size="sm"
                            className="flex-grow-1"
                            onClick={() => handleSetCover(index)}
                            style={{ backgroundColor: '#A2CB8B', borderColor: '#A2CB8B' }}
                          >
                            <i className="ri-star-line me-1"></i>Set as Cover
                          </Button>
                        )}

                        <Button
                          color="secondary"
                          size="sm"
                          className="btn-icon"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <i className="ri-arrow-up-line"></i>
                        </Button>

                        <Button
                          color="secondary"
                          size="sm"
                          className="btn-icon"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === allMedia.length - 1}
                        >
                          <i className="ri-arrow-down-line"></i>
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        )}

        {allMedia.length === 0 && (
          <Col lg={12}>
            <div className="alert alert-warning" role="alert">
              <i className="ri-error-warning-line me-2"></i>
              <strong>No photos uploaded yet.</strong> Please upload at least one photo to continue.
            </div>
          </Col>
        )}

        {dropError && (
          <Col lg={12}>
            <div className="alert alert-danger" role="alert">
              <i className="ri-close-circle-line me-2"></i>
              {dropError}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default MediaStep;

