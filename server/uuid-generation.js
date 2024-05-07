const {
  v1: uuidv1,
} = require('uuid');

const callUuidGenerator = async () => {
  try {
    const id  = uuidv1();
    return {
      id,
      error: null,
    };
  } catch (error) {
    return {
      id: null,
      error: error.message,
    };
  }
};

module.exports = callUuidGenerator;