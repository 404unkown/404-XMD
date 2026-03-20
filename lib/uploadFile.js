const fetch = require('node-fetch');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

/**
 * Upload epheremal file to file.io
 * `Expired in 1 day`
 * `100MB Max Filesize`
 * @param {Buffer} buffer File Buffer
 */
const fileIO = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {};
  const form = new FormData();
  form.append('file', buffer, 'tmp.' + ext);
  
  const res = await fetch('https://file.io/?expires=1d', { // 1 Day Expiry Date
    method: 'POST',
    body: form,
  });
  
  const json = await res.json();
  if (!json.success) throw json;
  return json.link;
};

/**
 * Upload file to storage.restfulapi.my.id
 * @param {Buffer|ReadableStream|(Buffer|ReadableStream)[]} inp File Buffer/Stream or Array of them
 * @return {string|null|(string|null)[]}
 */
const RESTfulAPI = async (inp) => {
  const form = new FormData();
  let buffers = inp;
  
  if (!Array.isArray(inp)) buffers = [inp];
  
  for (const buffer of buffers) {
    form.append('file', buffer);
  }
  
  const res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form,
  });
  
  let json = await res.text();
  
  try {
    json = JSON.parse(json);
    if (!Array.isArray(inp)) return json.files[0].url;
    return json.files.map((res) => res.url);
  } catch (e) {
    throw json;
  }
};

/**
 * Upload file with multiple fallback services
 * @param {Buffer} inp
 * @return {Promise<string>}
 */
async function uploadFile(inp) {
  let lastError;
  
  // Try different upload services
  const uploadServices = [RESTfulAPI, fileIO];
  
  for (const upload of uploadServices) {
    try {
      return await upload(inp);
    } catch (e) {
      lastError = e;
      console.log(`Upload service ${upload.name} failed:`, e.message);
      continue;
    }
  }
  
  // If all services fail, try one more simple service
  try {
    const form = new FormData();
    form.append('file', inp, 'upload.jpg');
    
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: form
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }
  } catch (error) {
    console.log('Fallback upload also failed:', error.message);
  }
  
  // Last resort: return as base64 data URL
  if (lastError) {
    console.error('All upload services failed, using base64 fallback');
    const { mime } = await fileTypeFromBuffer(inp) || { mime: 'application/octet-stream' };
    const base64 = inp.toString('base64');
    return `data:${mime};base64,${base64}`;
  }
  
  throw lastError;
}

module.exports = uploadFile;