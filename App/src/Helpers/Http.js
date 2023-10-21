import axios from "axios";
const apiUrl = "http://localhost:5000/api";

export const httpRequest = async (requestData, route, method="POST") => {
    const requestOptions = {
      method: method,
      url: apiUrl + "/"+ route,
      data: requestData,
      headers: {
        "Content-Type": "application/json",
      },
    };
    var response = await axios(requestOptions);
    return response.data;
};