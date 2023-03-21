const MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
const MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER;

const protobuffTimestamp = {
  title: 'Timestamp',
  type: 'object',
  properties: {
    seconds: {
      type: 'integer',
      minimum: 0,
      maximum: MAX_SAFE_INTEGER,
      default: 0,
      description: 'Represents seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.'
    },
    nanos: {
      type: 'integer',
      minimum: 0,
      maximum: 999999999,
      default: 0,
      description: 'Non-negative fractions of a second at nanosecond resolution.'
    }
  },
  description: 'A Timestamp represents a point in time independent of any time zone or local calendar, encoded as a count of seconds and fractions of seconds at nanosecond resolution. The count is relative to an epoch at UTC midnight on January 1, 1970, in the proleptic Gregorian calendar which extends the Gregorian calendar backwards to year one.\n\nAll minutes are 60 seconds long. Leap seconds are "smeared" so that no leap  second table is needed for interpretation, using a [24-hour linear smear](https://developers.google.com/time/smear).\n\nThe range is from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999999Z. By restricting to that range, we ensure that we can convert to and from [RFC3339](https://www.ietf.org/rfc/rfc3339.txt) date strings.'
};

module.exports = {
  'google.protobuf.Duration': {
    title: 'Duration',
    type: 'object',
    properties: {
      seconds: {
        type: 'integer',
        minimum: -315576000000,
        maximum: 315576000000,
        default: 0,
        description: 'Signed seconds of the span of time. Note: these bounds are computed from: 60 sec/min * 60 min/hr * 24 hr/day * 365.25 days/year * 10000 years'
      },
      nanos: {
        type: 'integer',
        minimum: -999999999,
        maximum: 999999999,
        default: 0,
        description: 'Signed fractions of a second at nanosecond resolution of the span of time. Durations less than one second are represented with a 0 `seconds` field and a positive or negative `nanos` field. For durations of one second or more, a non-zero value for the `nanos` field must be of the same sign as the `seconds` field.'
      }
    },
    description: 'A Duration represents a signed, fixed-length span of time represented as a count of seconds and fractions of seconds at nanosecond resolution. It is independent of any calendar and concepts like day or month'
  },
  'google.protobuf.Empty': {
    title: 'Empty',
    type: 'object',
    description: 'A generic empty message that you can re-use to avoid defining duplicated empty messages in your APIs.'
  },
  'google.protobuf.Timestamp': protobuffTimestamp,
  'google.protobuf.DoubleValue': {
    title: 'DoubleValue',
    type: ['null', 'number'],
    'x-primitive': 'double',
  },
  'google.protobuf.FloatValue': {
    title: 'FloatValue',
    type: ['null', 'number'],
    'x-primitive': 'float',
  },
  'google.protobuf.Int64Value': {
    title: 'Int64Value',
    type: ['null', 'integer'],
    minimum: MIN_SAFE_INTEGER,
    maximum: MAX_SAFE_INTEGER,
    'x-primitive': 'int64',
  },
  'google.protobuf.UInt64Value': {
    title: 'UInt64Value',
    type: ['null', 'integer'],
    minimum: 0,
    maximum: MAX_SAFE_INTEGER,
    'x-primitive': 'uint64',
  },
  'google.protobuf.Int32Value': {
    title: 'Int32Value',
    type: ['null', 'integer'],
    minimum: -0x80000000,
    maximum: 0x7fffffff,
    'x-primitive': 'int32',
  },
  'google.protobuf.UInt32Value': {
    title: 'UInt32Value',
    type: ['null', 'integer'],
    minimum: 0,
    maximum: 0xffffffff,
    'x-primitive': 'uint32',
  },
  'google.protobuf.BoolValue': {
    title: 'BoolValue',
    type: ['null', 'boolean'],
    'x-primitive': 'bool',
  },
  'google.protobuf.StringValue': {
    title: 'StringValue',
    type: ['null', 'string'],
    'x-primitive': 'string',
  },
  'google.protobuf.BytesValue': {
    title: 'BytesValue',
    type: ['null', 'string'],
    'x-primitive': 'bytes',
  },

  // https://github.com/googleapis/googleapis/tree/master/google/type
  'google.type.CalendarPeriod': {
    type: 'string',
    title: 'CalendarPeriod',
    enum: [
      'CALENDAR_PERIOD_UNSPECIFIED',
      'DAY',
      'WEEK',
      'FORTNIGHT',
      'MONTH',
      'QUARTER',
      'HALF',
      'YEAR'
    ],
    description: 'A `CalendarPeriod` represents the abstract concept of a time period that has a canonical start. Grammatically, "the start of the current  `CalendarPeriod`." All calendar times begin at midnight UTC.'
  },
  'google.type.Color': {
    type: 'object',
    title: 'Color',
    required: [
      'red',
      'green',
      'blue'
    ],
    properties: {
      red: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'The amount of red in the color as a value in the interval [0, 1].'
      },
      green: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'The amount of green in the color as a value in the interval [0, 1].'
      },
      blue: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'The amount of blue in the color as a value in the interval [0, 1].'
      },
      alpha: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'This means that a value of 1.0 corresponds to a solid color, whereas a value of 0.0 corresponds to a completely transparent color.'
      }
    },
    description: 'Represents a color in the RGBA color space.'
  },
  'google.type.Date': {
    type: 'object',
    title: 'Date',
    required: [
      'year',
      'month',
      'day'
    ],
    properties: {
      year: {
        type: 'integer',
        minimum: 0,
        maximum: 9999,
        description: 'Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year'
      },
      month: {
        type: 'integer',
        minimum: 0,
        maximum: 12,
        description: 'Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day.'
      },
      day: {
        type: 'integer',
        minimum: 0,
        maximum: 31,
        description: 'Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn\'t significant.'
      }
    },
    description: 'Represents a whole or partial calendar date, such as a birthday. The time of day and time zone are either specified elsewhere or are insignificant. The date is relative to the Gregorian Calendar. This can represent one of the following:\n\n* A full date, with non-zero year, month, and day values\n* A month and day value, with a zero year, such as an anniversary\n* A year on its own, with zero month and day values\n* A year and month value, with a zero day, such as a credit card expiration date'
  },
  'google.type.DateTime': {
    type: 'object',
    title: 'DateTime',
    required: [
      'year',
      'month',
      'day',
      'hours',
      'minutes',
      'seconds',
      'nanos'
    ],
    properties: {
      year: {
        type: 'integer',
        minimum: 0,
        maximum: 9999,
        description: 'Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year'
      },
      month: {
        type: 'integer',
        minimum: 0,
        maximum: 12,
        description: 'Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day.'
      },
      day: {
        type: 'integer',
        minimum: 0,
        maximum: 31,
        description: 'Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn\'t significant.'
      },
      hours: {
        type: 'integer',
        minimum: 0,
        maximum: 23,
        description: 'Hours of day in 24 hour format. Should be from 0 to 23'
      },
      minutes: {
        type: 'integer',
        minimum: 0,
        maximum: 59,
        description: 'Minutes of hour of day'
      },
      seconds: {
        type: 'integer',
        minimum: 0,
        maximum: 60,
        description: 'Seconds of minutes of the time. Must normally be from 0 to 59. An API may allow the value 60 if it allows leap-seconds.'
      },
      nanos: {
        type: 'integer',
        minimum: 0,
        maximum: 999999999,
        description: 'Fractions of seconds in nanoseconds.'
      },
      time_offset: {
        oneOf: [
          {
            type: 'object',
            title: 'TimeZone',
            required: [
              'id'
            ],
            properties: {
              id: {
                type: 'string',
                description: 'IANA Time Zone Database time zone, e.g. "America/New_York".'
              },
              version: {
                type: 'string',
                description: 'IANA Time Zone Database version number, e.g. "2019a".'
              }
            },
            description: 'Represents a time zone from the [IANA Time Zone Database](https://www.iana.org/time-zones).'
          },
          {
            type: 'object',
            title: 'Duration',
            properties: {
              seconds: {
                type: 'integer',
                minimum: -315576000000,
                maximum: 315576000000,
                default: 0,
                description: 'Signed seconds of the span of time. Note: these bounds are computed from: 60 sec/min * 60 min/hr * 24 hr/day * 365.25 days/year * 10000 years'
              },
              nanos: {
                type: 'integer',
                minimum: -999999999,
                maximum: 999999999,
                default: 0,
                description: 'Signed fractions of a second at nanosecond resolution of the span of time. Durations less than one second are represented with a 0 `seconds` field and a positive or negative `nanos` field. For durations of one second or more, a non-zero value for the `nanos` field must be of the same sign as the `seconds` field.'
              }
            },
            description: 'A Duration represents a signed, fixed-length span of time represented as a count of seconds and fractions of seconds at nanosecond resolution. It is independent of any calendar and concepts like day or month'
          }
        ]
      }
    },
    description: 'Represents civil time (or occasionally physical time).'
  },
  'google.type.TimeZone': {
    type: 'object',
    title: 'TimeZone',
    required: [
      'id'
    ],
    properties: {
      id: {
        type: 'string',
        description: 'IANA Time Zone Database time zone, e.g. "America/New_York".'
      },
      version: {
        type: 'string',
        description: 'IANA Time Zone Database version number, e.g. "2019a".'
      }
    },
    description: 'Represents a time zone from the [IANA Time Zone Database](https://www.iana.org/time-zones).'
  },
  'google.type.Decimal': {
    type: 'string',
    title: 'Decimal',
    examples: [
      '2.5e8',
      '-2.5e8',
      '2.5'
    ],
    description: 'A representation of a decimal value, such as 2.5. Clients may convert values into language-native decimal formats, such as Java\'s [BigDecimal][] or Python\'s [decimal.Decimal][].\n\nThe string representation consists of an optional sign, `+` (`U+002B`) or `-` (`U+002D`), followed by a sequence of zero or more decimal digits ("the integer"), optionally followed by a fraction, optionally followed by an exponent.\n\nThe fraction consists of a decimal point followed by zero or more decimal digits. The string must contain at least one digit in either the integer or the fraction. The number formed by the sign, the integer and the fraction is referred to as the significand.\n\nServices **should** normalize decimal values before storing them by:\n- Removing an explicitly-provided `+` sign (`+2.5` -> `2.5`).\n- Replacing a zero-length integer value with `0` (`.5` -> `0.5`).\n- Coercing the exponent character to lower-case (`2.5E8` -> `2.5e8`).\n- Removing an explicitly-provided zero exponent (`2.5e0` -> `2.5`).'
  },
  'google.type.Expr': {
    type: 'object',
    title: 'Expr',
    required: [
      'expression'
    ],
    properties: {
      expression: {
        type: 'string',
        description: 'Textual representation of an expression in Common Expression Language syntax',
        examples: [
          '\'New message received at \' + string(document.create_time)',
          'document.type != \'private\' && document.type != \'internal\''
        ]
      },
      title: {
        type: 'string',
        description: 'Title for the expression, i.e. a short string describing its purpose. This can be used e.g. in UIs which allow to enter the expression',
        examples: [
          'Notification string',
          'Public documents'
        ]
      },
      description: {
        type: 'string',
        description: ' Description of the expression. This is a longer text which describes the expression, e.g. when hovered over it in a UI.',
        examples: [
          'Determine whether the document should be publicly visible',
          'Create a notification string with a timestamp.'
        ]
      },
      location: {
        type: 'string',
        description: 'String indicating the location of the expression for error reporting, e.g. a file name and a position in the file.'
      }
    },
    description: 'Represents a textual expression in the Common Expression Language (CEL) syntax. CEL is a C-like expression language. The syntax and semantics of CEL are documented at https://github.com/google/cel-spec.'
  },
  'google.type.Fraction': {
    type: 'object',
    title: 'Fraction',
    required: [
      'numerator',
      'denominator'
    ],
    properties: {
      expression: {
        type: 'integer',
        minimum: MIN_SAFE_INTEGER,
        maximum: MAX_SAFE_INTEGER,
        description: 'The numerator in the fraction, e.g. 2 in 2/3.',
      },
      title: {
        type: 'integer',
        minimum: 0,
        maximum: MAX_SAFE_INTEGER,
        description: 'The value by which the numerator is divided, e.g. 3 in 2/3.',
      }
    },
    description: 'Represents a fraction in terms of a numerator divided by a denominator.'
  },
  'google.type.Interval': {
    type: 'object',
    title: 'Interval',
    properties: {
      start_time: {
        ...protobuffTimestamp,
        description: 'If specified, a Timestamp matching this interval will have to be the same or after the start.',
      },
      end_time: {
        ...protobuffTimestamp,
        description: 'If specified, a Timestamp matching this interval will have to be before the end.',
      }
    },
    description: 'Represents a time interval, encoded as a Timestamp start (inclusive) and a Timestamp end (exclusive).'
  },
  'google.type.LatLng': {
    type: 'object',
    title: 'LatLng',
    required: [
      'latitude',
      'longitude'
    ],
    properties: {
      latitude: {
        type: 'number',
        minimum: -90,
        maximum: +90,
        description: 'The latitude in degrees.',
      },
      longitude: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'The longitude in degrees.',
      }
    },
    description: 'An object that represents a latitude/longitude pair. This is expressed as a pair of doubles to represent degrees latitude and degrees longitude. Unless specified otherwise, this must conform to the <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84 standard</a>. Values must be within normalized ranges.'
  },
  'google.type.LocalizedText': {
    type: 'object',
    title: 'LocalizedText',
    required: [
      'text',
      'language_code'
    ],
    properties: {
      text: {
        type: 'string',
        description: 'Localized string in the language corresponding to \`language_code\'',
      },
      language_code: {
        type: 'string',
        examples: [
          'en-US',
          'sr-Latn'
        ],
        description: 'The text\'s BCP-47 language code, such as "en-US" or "sr-Latn".',
      }
    },
    description: 'Localized variant of a text in a particular language.'
  },
  'google.type.Money': {
    type: 'object',
    title: 'Money',
    required: [
      'currency_code',
      'units',
      'nanos'
    ],
    properties: {
      currency_code: {
        type: 'string',
        examples: [
          'USD'
        ],
        description: 'The three-letter currency code defined in ISO 4217.',
      },
      units: {
        type: 'integer',
        minimum: MIN_SAFE_INTEGER,
        maximum: MAX_SAFE_INTEGER,
        description: 'The whole units of the amount.',
      },      
      nanos: {
        type: 'integer',
        minimum: -999999999,
        maximum: 999999999,
        description: 'Number of nano (10^-9) units of the amount',
      }
    },
    description: 'Represents an amount of money with its currency type.'
  },
  'google.type.Month': {
    type: 'string',
    title: 'Month',
    enum: [
      'MONTH_UNSPECIFIED',
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER'
    ],
    description: 'Represents a month in the Gregorian calendar.'
  },
  'google.type.PostalAddress': {
    type: 'object',
    title: 'PostalAddress',
    required: [
      'revision',
      'region_code',
      'address_lines'
    ],
    properties: {
      revision: {
        type: 'integer',
        minimum: 0,
        maximum: 0,
        default: 0,
        description: 'The schema revision of the `PostalAddress`. This must be set to 0, which is the latest revision.',
      },
      region_code: {
        type: 'string',
        examples: [
          'CH'
        ],
        description: 'CLDR region code of the country/region of the address. This is never inferred and it is up to the user to ensure the value is correct. See http://cldr.unicode.org/ and http://www.unicode.org/cldr/charts/30/supplemental/territory_information.html for details.',
      },
      language_code: {
        type: 'string',
        examples: [
          'zh-Hant', 
          'ja',
          'ja-Latn', 
          'en'
        ],
        description: 'BCP-47 language code of the contents of this address (if known). This is often the UI language of the input form or is expected to match one of the languages used in the address country/region, or their transliterated equivalents. This can affect formatting in certain countries, but is not critical to the correctness of the data and will never affect any validation or other non-formatting related operations.'
      },
      postal_code: {
        type: 'string',
        examples: [
          '3600'
        ],
        description: 'Postal code of the address. Not all countries use or require postal codes to be present, but where they are used, they may trigger additional validation with other parts of the address (e.g. state/zip validation in the U.S.A.).',
      },
      sorting_code: {
        type: 'string',
        examples: [
          'CEDEX 7'
        ],
        description: 'Additional, country-specific, sorting code. This is not used in most regions. Where it is used, the value is either a string like "CEDEX", optionally followed by a number (e.g. "CEDEX 7"), or just a number alone, representing the "sector code" (Jamaica), "delivery area indicator" (Malawi) or "post office indicator" (e.g. Côte d\'Ivoire).',
      },
      administrative_area: {
        type: 'string',
        description: 'Highest administrative subdivision which is used for postal addresses of a country or region. For example, this can be a state, a province, an oblast, or a prefecture. Specifically, for Spain this is the province and not the autonomous community (e.g. "Barcelona" and not "Catalonia"). Many countries don\'t use an administrative area in postal addresses. E.g. in Switzerland this should be left unpopulated.',
      },
      locality: {
        type: 'string',
        description: 'Generally refers to the city/town portion of the address. Examples: US city, IT comune, UK post town. In regions of the world where localities are not well defined or do not fit into this structure well, leave locality empty and use address_lines.',
      },
      sublocality: {
        type: 'string',
        description: 'Sublocality of the address. For example, this can be neighborhoods, boroughs, districts.',
      },
      address_lines: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Unstructured address lines describing the lower levels of an address. Because values in address_lines do not have type information and may sometimes contain multiple values in a single field (e.g. "Austin, TX")',
      },
      recipients: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'The recipient at the address. This field may, under certain circumstances, contain multiline information. For example, it might contain "care of" information.',
      },
      organization: {
        type: 'string',
        description: 'The name of the organization at the address.',
      }
    },
    description: 'Represents a postal address, e.g. for postal delivery or payments addresses. Given a postal address, a postal service can deliver items to a premise, P.O. Box or similar. It is not intended to model geographical locations (roads, towns, mountains).'
  },
  'google.type.Quaternion': {
    type: 'object',
    title: 'Quaternion',
    required: [
      'x',
      'y',
      'z',
      'w'
    ],
    properties: {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      },
      z: {
        type: 'number'
      },
      w: {
        type: 'number'
      }
    },
    description: 'A quaternion is defined as the quotient of two directed lines in a three-dimensional space or equivalently as the quotient of two Euclidean vectors (https://en.wikipedia.org/wiki/Quaternion).'
  }
};