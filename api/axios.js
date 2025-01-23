import axios from "axios";
import dotenv from 'dotenv';

const API_KEY = '';
const baseURL = '';

const instance = axios.create({
    baseURL: baseURL,
    timeout:5000,
    withCredentials: true,
    params: {
        api_key: API_KEY,
        language: ko
    }
})