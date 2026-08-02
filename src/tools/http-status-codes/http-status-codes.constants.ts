export const codesByCategories: {
  category: string
  codes: {
    code: number
    name: string
    description: string
    type: 'HTTP' | 'WebDav'
  }[]
}[] = [
  {
    category: '1xx informational response',
    codes: [
      {
        code: 100,
        name: 'Continue',
        description: 'Waiting for the client to emit the body of the request.',
        type: 'HTTP',
      },
      {
        code: 101,
        name: 'Switching Protocols',
        description: 'The server has agreed to change protocol.',
        type: 'HTTP',
      },
      {
        code: 102,
        name: 'Processing',
        description: 'The server is processing the request, but no response is available yet.',
        type: 'WebDav',
      },
      {
        code: 103,
        name: 'Early Hints',
        description: 'The server returns some response headers before final HTTP message.',
        type: 'HTTP',
      },
      {
        code: 104,
        name: 'Upload Resumption Supported',
        description:
          'Indicates that the server supports resuming interrupted uploads via the Upload-Offset request header.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '2xx success',
    codes: [
      {
        code: 200,
        name: 'OK',
        description: 'Standard response for successful HTTP requests.',
        type: 'HTTP',
      },
      {
        code: 201,
        name: 'Created',
        description: 'The request has been fulfilled, resulting in the creation of a new resource.',
        type: 'HTTP',
      },
      {
        code: 202,
        name: 'Accepted',
        description: 'The request has been accepted for processing, but the processing has not been completed.',
        type: 'HTTP',
      },
      {
        code: 203,
        name: 'Non-Authoritative Information',
        description:
          'The request is successful but the content of the original request has been modified by a transforming proxy.',
        type: 'HTTP',
      },
      {
        code: 204,
        name: 'No Content',
        description: 'The server successfully processed the request and is not returning any content.',
        type: 'HTTP',
      },
      {
        code: 205,
        name: 'Reset Content',
        description: 'The server indicates to reinitialize the document view which sent this request.',
        type: 'HTTP',
      },
      {
        code: 206,
        name: 'Partial Content',
        description: 'The server is delivering only part of the resource due to a range header sent by the client.',
        type: 'HTTP',
      },
      {
        code: 207,
        name: 'Multi-Status',
        description:
          'The message body that follows is an XML message and can contain a number of separate response codes.',
        type: 'WebDav',
      },
      {
        code: 208,
        name: 'Already Reported',
        description:
          'The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response.',
        type: 'WebDav',
      },
      {
        code: 226,
        name: 'IM Used',
        description:
          'The server has fulfilled a request for the resource, and the response is a representation of the result.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '3xx redirection',
    codes: [
      {
        code: 300,
        name: 'Multiple Choices',
        description: 'Indicates multiple options for the resource that the client may follow.',
        type: 'HTTP',
      },
      {
        code: 301,
        name: 'Moved Permanently',
        description: 'This and all future requests should be directed to the given URI.',
        type: 'HTTP',
      },
      {
        code: 302,
        name: 'Found',
        description: 'Redirect to another URL. This is an example of industry practice contradicting the standard.',
        type: 'HTTP',
      },
      {
        code: 303,
        name: 'See Other',
        description: 'The response to the request can be found under another URI using a GET method.',
        type: 'HTTP',
      },
      {
        code: 304,
        name: 'Not Modified',
        description:
          'Indicates that the resource has not been modified since the version specified by the request headers.',
        type: 'HTTP',
      },
      {
        code: 305,
        name: 'Use Proxy',
        description:
          'The requested resource is available only through a proxy, the address for which is provided in the response.',
        type: 'HTTP',
      },
      {
        code: 306,
        name: 'Switch Proxy',
        description: 'No longer used. Originally meant "Subsequent requests should use the specified proxy."',
        type: 'HTTP',
      },
      {
        code: 307,
        name: 'Temporary Redirect',
        description:
          'In this case, the request should be repeated with another URI; however, future requests should still use the original URI.',
        type: 'HTTP',
      },
      {
        code: 308,
        name: 'Permanent Redirect',
        description: 'The request and all future requests should be repeated using another URI.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '4xx client error',
    codes: [
      {
        code: 400,
        name: 'Bad Request',
        description: 'The server cannot or will not process the request due to an apparent client error.',
        type: 'HTTP',
      },
      {
        code: 401,
        name: 'Unauthorized',
        description:
          'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.',
        type: 'HTTP',
      },
      {
        code: 402,
        name: 'Payment Required',
        description:
          'Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme.',
        type: 'HTTP',
      },
      {
        code: 403,
        name: 'Forbidden',
        description:
          'The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource.',
        type: 'HTTP',
      },
      {
        code: 404,
        name: 'Not Found',
        description: 'The requested resource could not be found but may be available in the future.',
        type: 'HTTP',
      },
      {
        code: 405,
        name: 'Method Not Allowed',
        description: 'A request method is not supported for the requested resource.',
        type: 'HTTP',
      },
      {
        code: 406,
        name: 'Not Acceptable',
        description:
          'The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.',
        type: 'HTTP',
      },
      {
        code: 407,
        name: 'Proxy Authentication Required',
        description: 'The client must first authenticate itself with the proxy.',
        type: 'HTTP',
      },
      {
        code: 408,
        name: 'Request Timeout',
        description: 'The server timed out waiting for the request.',
        type: 'HTTP',
      },
      {
        code: 409,
        name: 'Conflict',
        description:
          'Indicates that the request could not be processed because of conflict in the request, such as an edit conflict.',
        type: 'HTTP',
      },
      {
        code: 410,
        name: 'Gone',
        description: 'Indicates that the resource requested is no longer available and will not be available again.',
        type: 'HTTP',
      },
      {
        code: 411,
        name: 'Length Required',
        description:
          'The request did not specify the length of its content, which is required by the requested resource.',
        type: 'HTTP',
      },
      {
        code: 412,
        name: 'Precondition Failed',
        description: 'The server does not meet one of the preconditions that the requester put on the request.',
        type: 'HTTP',
      },
      {
        code: 413,
        name: 'Payload Too Large',
        description: 'The request is larger than the server is willing or able to process.',
        type: 'HTTP',
      },
      {
        code: 414,
        name: 'URI Too Long',
        description: 'The URI provided was too long for the server to process.',
        type: 'HTTP',
      },
      {
        code: 415,
        name: 'Unsupported Media Type',
        description: 'The request entity has a media type which the server or resource does not support.',
        type: 'HTTP',
      },
      {
        code: 416,
        name: 'Range Not Satisfiable',
        description: 'The client has asked for a portion of the file, but the server cannot supply that portion.',
        type: 'HTTP',
      },
      {
        code: 417,
        name: 'Expectation Failed',
        description: 'The server cannot meet the requirements of the Expect request-header field.',
        type: 'HTTP',
      },
      {
        code: 418,
        name: 'I\'m a teapot',
        description: 'The server refuses the attempt to brew coffee with a teapot.',
        type: 'HTTP',
      },
      {
        code: 419,
        name: 'Page Expired',
        description: 'A CSRF token is missing or expired (used by the Laravel framework).',
        type: 'HTTP',
      },
      {
        code: 420,
        name: 'Method Failure',
        description:
          'A deprecated response status proposed during WebDAV development, used by the Spring framework when a method has failed.',
        type: 'HTTP',
      },
      {
        code: 421,
        name: 'Misdirected Request',
        description: 'The request was directed at a server that is not able to produce a response.',
        type: 'HTTP',
      },
      {
        code: 422,
        name: 'Unprocessable Entity',
        description: 'The request was well-formed but was unable to be followed due to semantic errors.',
        type: 'HTTP',
      },
      {
        code: 423,
        name: 'Locked',
        description: 'The resource that is being accessed is locked.',
        type: 'HTTP',
      },
      {
        code: 424,
        name: 'Failed Dependency',
        description: 'The request failed due to failure of a previous request.',
        type: 'HTTP',
      },
      {
        code: 425,
        name: 'Too Early',
        description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.',
        type: 'HTTP',
      },
      {
        code: 426,
        name: 'Upgrade Required',
        description: 'The client should switch to a different protocol such as TLS/1.0.',
        type: 'HTTP',
      },
      {
        code: 428,
        name: 'Precondition Required',
        description: 'The origin server requires the request to be conditional.',
        type: 'HTTP',
      },
      {
        code: 429,
        name: 'Too Many Requests',
        description: 'The user has sent too many requests in a given amount of time.',
        type: 'HTTP',
      },
      {
        code: 431,
        name: 'Request Header Fields Too Large',
        description:
          'The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.',
        type: 'HTTP',
      },
      {
        code: 451,
        name: 'Unavailable For Legal Reasons',
        description:
          'A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource.',
        type: 'HTTP',
      },
      {
        code: 440,
        name: 'Login Time-out',
        description: 'The client\'s session has expired and must log in again (used by IIS).',
        type: 'HTTP',
      },
      {
        code: 444,
        name: 'No Response',
        description: 'Used internally by nginx to instruct the server to return no information and close the connection.',
        type: 'HTTP',
      },
      {
        code: 449,
        name: 'Retry With',
        description: 'The server cannot honor the request because the user has not provided the required information (IIS).',
        type: 'HTTP',
      },
      {
        code: 450,
        name: 'Blocked by Windows Parental Controls',
        description: 'Indicates that Windows Parental Controls block access to the requested webpage (IIS).',
        type: 'HTTP',
      },
      {
        code: 498,
        name: 'Invalid Token',
        description: 'Indicates an expired or otherwise invalid authentication token (used by ArcGIS).',
        type: 'HTTP',
      },
      {
        code: 499,
        name: 'Client Closed Request',
        description: 'Used when the client has closed the request before the server could send a response (nginx).',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '5xx server error',
    codes: [
      {
        code: 500,
        name: 'Internal Server Error',
        description:
          'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.',
        type: 'HTTP',
      },
      {
        code: 501,
        name: 'Not Implemented',
        description:
          'The server either does not recognize the request method, or it lacks the ability to fulfill the request.',
        type: 'HTTP',
      },
      {
        code: 502,
        name: 'Bad Gateway',
        description:
          'The server was acting as a gateway or proxy and received an invalid response from the upstream server.',
        type: 'HTTP',
      },
      {
        code: 503,
        name: 'Service Unavailable',
        description: 'The server is currently unavailable (because it is overloaded or down for maintenance).',
        type: 'HTTP',
      },
      {
        code: 504,
        name: 'Gateway Timeout',
        description:
          'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.',
        type: 'HTTP',
      },
      {
        code: 505,
        name: 'HTTP Version Not Supported',
        description: 'The server does not support the HTTP protocol version used in the request.',
        type: 'HTTP',
      },
      {
        code: 506,
        name: 'Variant Also Negotiates',
        description: 'Transparent content negotiation for the request results in a circular reference.',
        type: 'HTTP',
      },
      {
        code: 507,
        name: 'Insufficient Storage',
        description: 'The server is unable to store the representation needed to complete the request.',
        type: 'HTTP',
      },
      {
        code: 508,
        name: 'Loop Detected',
        description: 'The server detected an infinite loop while processing the request.',
        type: 'HTTP',
      },
      {
        code: 510,
        name: 'Not Extended',
        description: 'Further extensions to the request are required for the server to fulfill it.',
        type: 'HTTP',
      },
      {
        code: 511,
        name: 'Network Authentication Required',
        description: 'The client needs to authenticate to gain network access.',
        type: 'HTTP',
      },
      {
        code: 509,
        name: 'Bandwidth Limit Exceeded',
        description: 'The server has exceeded the bandwidth specified by the administrator, often used by shared hosting.',
        type: 'HTTP',
      },
      {
        code: 520,
        name: 'Web Server Returned an Unknown Error',
        description: 'The origin server returned an empty, unknown, or unexpected response to Cloudflare.',
        type: 'HTTP',
      },
      {
        code: 521,
        name: 'Web Server Is Down',
        description: 'The origin server refused connections from Cloudflare.',
        type: 'HTTP',
      },
      {
        code: 522,
        name: 'Connection Timed Out',
        description: 'Cloudflare timed out contacting the origin server.',
        type: 'HTTP',
      },
      {
        code: 523,
        name: 'Origin Is Unreachable',
        description: 'Cloudflare could not contact the origin server.',
        type: 'HTTP',
      },
      {
        code: 524,
        name: 'A Timeout Occurred',
        description: 'Cloudflare made a TCP connection to the origin server, but it did not provide a timely HTTP response.',
        type: 'HTTP',
      },
      {
        code: 525,
        name: 'SSL Handshake Failed',
        description: 'Cloudflare could not negotiate an SSL/TLS handshake with the origin server.',
        type: 'HTTP',
      },
      {
        code: 526,
        name: 'Invalid SSL Certificate',
        description: 'Cloudflare could not validate the SSL certificate on the origin web server.',
        type: 'HTTP',
      },
      {
        code: 530,
        name: 'Site Is Frozen',
        description: 'Indicates a site that has been frozen due to inactivity (used by Pantheon).',
        type: 'HTTP',
      },
      {
        code: 598,
        name: 'Network Read Timeout Error',
        description: 'An informal convention used by some HTTP proxies to signal a network read timeout.',
        type: 'HTTP',
      },
      {
        code: 599,
        name: 'Network Connect Timeout Error',
        description: 'An informal convention used by some HTTP proxies to signal a network connect timeout.',
        type: 'HTTP',
      },
    ],
  },
];
