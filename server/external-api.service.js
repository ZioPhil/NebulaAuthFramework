const axios = require("axios")

const callExternalApi = async (options) => {
  try {
    const response = await axios(options.config);
    const { data } = response;

    return {
      data,
      error: null,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;

      const { response } = axiosError;

      let message = "http request failed";

      if (response && response.statusText) {
        message = response.statusText;
      }

      if (axiosError.message) {
        message = axiosError.message;
      }

      if (response && response.data) {
        message = response.data;
      }

      return {
        data: null,
        error: {
          message,
        },
      };
    }

    return {
      data: null,
      error: {
        message: error.message,
      },
    };
  }
};

module.exports = callExternalApi;
