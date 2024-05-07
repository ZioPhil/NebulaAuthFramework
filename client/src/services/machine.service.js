import { callExternalApi } from "./external-api.service";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;
// requests to the server made with axios
export const getUsers = async (role, counter, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/users`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      role,
      counter,
      value,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const addUser = async (email, accessToken) => {
  const config = {
    url: `${apiServerUrl}/addUser`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      email,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getRoles = async (counter, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/roles`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      counter,
      value,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const updateRoleUsers = async (roleId, userId, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/updateRoleUsers`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      roleId,
      userId,
      value,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const updateRoleMachines = async (roleId, machineId, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/updateRoleMachines`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      roleId,
      machineId,
      value,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const createRole = async (name, accessToken) => {
  const config = {
    url: `${apiServerUrl}/createRole`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      name,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const deleteRole = async (roleId, accessToken) => {
  const config = {
    url: `${apiServerUrl}/deleteRole`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      roleId,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getMachinesNormal = async (counter, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/machinesNormal`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      counter,
      value,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getMachinesAdmin = async (role, counter, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/machinesAdmin`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      role,
      counter,
      value,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const generateCertificate = async (pubKey, id, name, ip_address, accessToken) => {
  const formData = new FormData();
  formData.append("key", pubKey);
  formData.append("id", id);
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
