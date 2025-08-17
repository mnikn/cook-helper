"use client"

export function request(url, params, options) {
  return fetch(url, {
    body: params ? JSON.stringify(params) : undefined,
    ...options,
  }).then(res => res.json())
}