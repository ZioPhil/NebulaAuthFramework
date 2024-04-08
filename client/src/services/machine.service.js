import { callExternalApi } from "./external-api.service";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;
// requests to the server made with axios
export const getMachinesNormal = async (accessToken) => {
  const config = {
    url: `${apiServerUrl}/machinesNormal`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getMachinesAdmin = async (accessToken) => {
  const config = {
    url: `${apiServerUrl}/machinesAdmin`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getUsers = async (accessToken) => {
  const config = {
    url: `${apiServerUrl}/users`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getRoles = async (accessToken) => {
  const config = {
    url: `${apiServerUrl}/roles`,
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const updateMachine = async (machine, accessToken) => {
  const config = {
    url: `${apiServerUrl}/updateMachine`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      machine,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const generateCertificate = async (pubKey, name, ip_address, accessToken) => {
  const formData = new FormData();
  formData.append("key", pubKey);
  formData.append("name", name);
  formData.append("ip_address", ip_address);
  formData.append("groups", name);

  const config = {
    url: `${apiServerUrl}/generateCertificate`,
    method: "POST",
    headers: {
      "content-type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
    data: formData,
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};
