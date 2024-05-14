import { callExternalApi } from "./external-api.service";

const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;
// requests to the server made with axios
export const getMachinesNormal = async (accessToken) => {
  const config = {
    url: `${apiServerUrl}/server/machinesNormal`,
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

export const getMachinesAdmin = async (role, accessToken) => {
  const config = {
    url: `${apiServerUrl}/server/machinesAdmin`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      role,
    },
  };

  const { data, error } = await callExternalApi({ config });

  return {
    data: data || null,
    error,
  };
};

export const getUsers = async (role, accessToken) => {
  const config = {
    url: `${apiServerUrl}/server/users`,
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      role,
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
    url: `${apiServerUrl}/server/roles`,
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

export const updateRoleUsers = async (roleId, userId, value, accessToken) => {
  const config = {
    url: `${apiServerUrl}/server/updateRoleUsers`,
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
    url: `${apiServerUrl}/server/updateRoleMachines`,
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
    url: `${apiServerUrl}/server/createRole`,
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
    url: `${apiServerUrl}/server/deleteRole`,
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

export const generateCertificate = async (pubKey, name, ip_address, accessToken) => {
  const formData = new FormData();
  formData.append("key", pubKey);
  formData.append("name", name);
  formData.append("ip_address", ip_address);
  formData.append("groups", name);

  const config = {
    url: `${apiServerUrl}/server/generateCertificate`,
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
