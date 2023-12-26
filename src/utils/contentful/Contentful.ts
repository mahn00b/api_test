import axios, { AxiosRequestConfig } from 'axios';

import { CONTENTFUL_BASE_URL } from '../../constants';

import resolveResponse from 'contentful-resolve-response';




export interface ContentfulRequestConfig {
    space: string;
    environment: string;
    managementToken: string;
}

function getAxiosConfigForContentfulRequest(space: string, environment: string, managementToken: string, additionalHeaders: any = {}): AxiosRequestConfig {
    return {
        baseURL: `${CONTENTFUL_BASE_URL}/spaces/${space}/environments/${environment}`,
        headers: {
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            Authorization: `Bearer ${managementToken}`,
            ...additionalHeaders,
        },
    };
}

export async function getContent(entryId: string, config: ContentfulRequestConfig): Promise<any> {
  try {
    const axiosConfig = getAxiosConfigForContentfulRequest(config.space, config.environment, config.managementToken);
    const response = await axios.get(`/entries/${entryId}`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error retrieving content:', error);
    throw error;
  }
}

export async function getContentAndNestedRefs(entryId: string, config: ContentfulRequestConfig): Promise<any> {
  try {
    const axiosConfig = getAxiosConfigForContentfulRequest(config.space, config.environment, config.managementToken);
    const response = await axios.get(`/entries/${entryId}/references?include=10`, axiosConfig);
    return resolveResponse(response.data);
  } catch (error) {
    console.error('Error retrieving content:', error);
    throw error;
  }
}

export async function createContent(contentTypeId: string, data: any, config: ContentfulRequestConfig): Promise<any> {
  try {
    const axiosConfig = getAxiosConfigForContentfulRequest(config.space, config.environment, config.managementToken, { 'X-Contentful-Content-Type': contentTypeId });
    const response = await axios.post('/entries',{
        ...axiosConfig,
        data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
}

