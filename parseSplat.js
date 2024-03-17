import * as THREE from "three";

function parseSplatFile(fileName) {
  return new Promise((resolve, reject) => {
    fetch(fileName)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const data = new Uint8Array(buffer);
        const splat_array = [];

        let offset = 0;

        while (offset < data.length) {
          const splat = {
            position: new Float32Array(3),
            scales: new Float32Array(3),
            color: new Uint8Array(4),
            rotation: new Float32Array(4),
          };

          // Read position
          for (let i = 0; i < 3; i++) {
            splat.position[i] = new Float32Array(
              data.slice(offset, offset + 4).buffer
            )[0];
            offset += 4;
          }

          // Read scales
          for (let i = 0; i < 3; i++) {
            splat.scales[i] = new Float32Array(
              data.slice(offset, offset + 4).buffer
            )[0];
            offset += 4;
          }

          // Read color
          for (let i = 0; i < 4; i++) {
            splat.color[i] = data[offset];
            offset += 1;
          }

          // Read rotation quaternion (decode components)
          for (let i = 0; i < 4; i++) {
            splat.rotation[i] = (data[offset] - 128) / 128;
            offset += 1;
          }

          splat_array.push(splat);
        }

        resolve(splat_array);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export default parseSplatFile;
