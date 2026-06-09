const test = require('node:test');
const assert = require('node:assert/strict');

process.env.MAINTENANCE_MODE_TEST_OVERRIDE = 'false';

const doctorService = require('../src/services/doctor.service');
const doctorController = require('../src/controllers/doctor.controller');

const createMockResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test('saveAnnotation response includes data.annotatedImageUrl', async () => {
  const originalSaveCaseAnnotation = doctorService.saveCaseAnnotation;
  const annotatedImageUrl = '/uploads/annotations/annotation_test.png';

  doctorService.saveCaseAnnotation = async (caseId, fileData) => {
    assert.equal(caseId, 'CASE-ANNOTATION-TEST');
    assert.equal(fileData.originalname, 'annotation.png');

    return {
      success: true,
      message: 'Coretan dokter berhasil disimpan pada data Scan',
      annotatedImageUrl,
    };
  };

  try {
    const req = {
      params: { caseId: 'CASE-ANNOTATION-TEST' },
      file: {
        originalname: 'annotation.png',
        buffer: Buffer.from('fake image bytes'),
      },
    };
    const res = createMockResponse();

    await doctorController.saveAnnotation(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      status: 'success',
      message: 'Coretan dokter berhasil disimpan pada data Scan',
      data: {
        annotatedImageUrl,
      },
    });
  } finally {
    doctorService.saveCaseAnnotation = originalSaveCaseAnnotation;
  }
});
