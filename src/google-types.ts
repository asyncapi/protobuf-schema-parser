// https://github.com/googleapis/googleapis/tree/master/google/type
const GOOGLE_TYPE = 'com.google.type';

export const googleProtoTypes: { [key: string]: { [k: string]: any } } = {
  'google/type/calendar_period.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              go_package: 'google.golang.org/genproto/googleapis/type/calendarperiod;calendarperiod',
              java_multiple_files: true,
              java_outer_classname: 'CalendarPeriodProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP',
            },
            nested: {
              CalendarPeriod: {
                values: {
                  CALENDAR_PERIOD_UNSPECIFIED: 0,
                  DAY: 1,
                  WEEK: 2,
                  FORTNIGHT: 3,
                  MONTH: 4,
                  QUARTER: 5,
                  HALF: 6,
                  YEAR: 7,
                },
              },
            },
            comment: 'A `CalendarPeriod` represents the abstract concept of a time period that has a canonical start. Grammatically, "the start of the current  `CalendarPeriod`." All calendar times begin at midnight UTC.',
          },
        },
      },
    },
  },
  'google/type/color.proto': {
    nested: {
      google: {
        nested: {
          protobufNested: {
            nested: {
              DoubleValue: {
                fields: {
                  value: {
                    type: 'double',
                    id: 1
                  }
                }
              },
              FloatValue: {
                fields: {
                  value: {
                    type: 'float',
                    id: 1
                  }
                }
              },
              Int64Value: {
                fields: {
                  value: {
                    type: 'int64',
                    id: 1
                  }
                }
              },
              UInt64Value: {
                fields: {
                  value: {
                    type: 'uint64',
                    id: 1
                  }
                }
              },
              Int32Value: {
                fields: {
                  value: {
                    type: 'int32',
                    id: 1
                  }
                }
              },
              UInt32Value: {
                fields: {
                  value: {
                    type: 'uint32',
                    id: 1
                  }
                }
              },
              BoolValue: {
                fields: {
                  value: {
                    type: 'bool',
                    id: 1
                  }
                }
              },
              StringValue: {
                fields: {
                  value: {
                    type: 'string',
                    id: 1
                  }
                }
              },
              BytesValue: {
                fields: {
                  value: {
                    type: 'bytes',
                    id: 1
                  }
                }
              }
            }
          },
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/color;color',
              java_multiple_files: true,
              java_outer_classname: 'ColorProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Color: {
                fields: {
                  red: {
                    type: 'float',
                    comment: 'The amount of red in the color as a value in the interval.\n@Min 0\n@Max 1',
                    id: 1
                  },
                  green: {
                    type: 'float',
                    comment: 'The amount of green in the color as a value in the interval.\n@Min 0\n@Max 1',
                    id: 2
                  },
                  blue: {
                    type: 'float',
                    comment: 'The amount of blue in the color as a value in the interval.\n@Min 0\n@Max 1',
                    id: 3
                  },
                  alpha: {
                    type: 'google.protobufNested.FloatValue',
                    comment: 'This means that a value of 1.0 corresponds to a solid color, whereas a value of 0.0 corresponds to a completely transparent color.\n@Min 0\n@Max 1',
                    id: 4
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/date.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/date;date',
              java_multiple_files: true,
              java_outer_classname: 'DateProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Date: {
                fields: {
                  year: {
                    type: 'int32',
                    comment: 'Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year\n@Min 0\n@Max 9999',
                    id: 1
                  },
                  month: {
                    type: 'int32',
                    comment: 'Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day.\n@Min 0\n@Max 12',
                    id: 2
                  },
                  day: {
                    type: 'int32',
                    comment: 'Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn\'t significant.\n@Min 0\n@Max 31',
                    id: 3
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/datetime.proto': {
    nested: {
      google: {
        nested: {
          protobufNested: {
            nested: {
              Duration: {
                fields: {
                  seconds: {
                    type: 'int64',
                    id: 1
                  },
                  nanos: {
                    type: 'int32',
                    id: 2
                  }
                }
              }
            }
          },
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/datetime;datetime',
              java_multiple_files: true,
              java_outer_classname: 'DateTimeProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              DateTime: {
                oneofs: {
                  timeOffset: {
                    oneof: [
                      'utcOffset',
                      'timeZone'
                    ]
                  }
                },
                fields: {
                  year: {
                    type: 'int32',
                    comment: 'Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year\n@Min 0\n@Max 9999',
                    id: 1
                  },
                  month: {
                    type: 'int32',
                    comment: 'Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day.\n@Min 0\n@Max 12',
                    id: 2
                  },
                  day: {
                    type: 'int32',
                    comment: 'Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn\'t significant.\n@Min 0\n@Max 31',
                    id: 3
                  },
                  hours: {
                    type: 'int32',
                    comment: 'Hours of day in 24 hour format.\n@Min 0\n@Max 23',
                    id: 4
                  },
                  minutes: {
                    type: 'int32',
                    comment: 'Minutes of hour of day.\n@Min 0\n@Max 59',
                    id: 5
                  },
                  seconds: {
                    type: 'int32',
                    comment: 'Seconds of minutes of the time. Must normally be from 0 to 59. An API may allow the value 60 if it allows leap-seconds.\n@Min 0\n@Max 60',
                    id: 6
                  },
                  nanos: {
                    type: 'int32',
                    comment: 'Fractions of seconds in nanoseconds.\n@Min 0\n@Max 999999999',
                    id: 7
                  },
                  utcOffset: {
                    type: 'google.protobufNested.Duration',
                    id: 8
                  },
                  timeZone: {
                    type: 'TimeZone',
                    id: 9
                  }
                }
              },
              TimeZone: {
                fields: {
                  id: {
                    type: 'string',
                    comment: 'IANA Time Zone Database time zone. @Example: America/New_York',
                    id: 1
                  },
                  version: {
                    type: 'string',
                    comment: 'IANA Time Zone Database version number. @Example: 2019a',
                    id: 2
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/dayofweek.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              go_package: 'google.golang.org/genproto/googleapis/type/dayofweek;dayofweek',
              java_multiple_files: true,
              java_outer_classname: 'DayOfWeekProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              DayOfWeek: {
                values: {
                  DAY_OF_WEEK_UNSPECIFIED: 0,
                  MONDAY: 1,
                  TUESDAY: 2,
                  WEDNESDAY: 3,
                  THURSDAY: 4,
                  FRIDAY: 5,
                  SATURDAY: 6,
                  SUNDAY: 7
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/decimal.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/decimal;decimal',
              java_multiple_files: true,
              java_outer_classname: 'DecimalProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Decimal: {
                fields: {
                  value: {
                    type: 'string',
                    comment: 'A representation of a decimal value, such as 2.5. Clients may convert values into language-native decimal formats, such as Java\'s [BigDecimal][] or Python\'s [decimal.Decimal][].\n\nThe string representation consists of an optional sign, `+` (`U+002B`) or `-` (`U+002D`), followed by a sequence of zero or more decimal digits ("the integer"), optionally followed by a fraction, optionally followed by an exponent.\n\nThe fraction consists of a decimal point followed by zero or more decimal digits. The string must contain at least one digit in either the integer or the fraction. The number formed by the sign, the integer and the fraction is referred to as the significand.\n\nServices **should** normalize decimal values before storing them by:\n- Removing an explicitly-provided `+` sign (`+2.5` -> `2.5`).\n- Replacing a zero-length integer value with `0` (`.5` -> `0.5`).\n- Coercing the exponent character to lower-case (`2.5E8` -> `2.5e8`).\n- Removing an explicitly-provided zero exponent (`2.5e0` -> `2.5`).\n@Example 2.5e8\n@Example -2.5e8\n@Example 2.5',
                    id: 1
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/expr.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              go_package: 'google.golang.org/genproto/googleapis/type/expr;expr',
              java_multiple_files: true,
              java_outer_classname: 'ExprProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Expr: {
                fields: {
                  expression: {
                    type: 'string',
                    comment: 'Textual representation of an expression in Common Expression Language syntax\n@Example \'New message received at \' + string(document.create_time)\n@Example document.type != \'private\' && document.type != \'internal\'',
                    id: 1
                  },
                  title: {
                    type: 'string',
                    comment: 'Title for the expression, i.e. a short string describing its purpose. This can be used e.g. in UIs which allow to enter the expression\n@Example Notification string\n@Example Public documents',
                    id: 2
                  },
                  description: {
                    type: 'string',
                    comment: 'Description of the expression. This is a longer text which describes the expression, e.g. when hovered over it in a UI.\n@Example Determine whether the document should be publicly visible\n@Example Create a notification string with a timestamp.',
                    id: 3
                  },
                  location: {
                    type: 'string',
                    comment: 'String indicating the location of the expression for error reporting, e.g. a file name and a position in the file.',
                    id: 4
                  }
                },
                comment: 'Represents a textual expression in the Common Expression Language (CEL) syntax. CEL is a C-like expression language. The syntax and semantics of CEL are documented at https://github.com/google/cel-spec.',
              }
            }
          }
        }
      }
    }
  },
  'google/type/fraction.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              go_package: 'google.golang.org/genproto/googleapis/type/fraction;fraction',
              java_multiple_files: true,
              java_outer_classname: 'FractionProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Fraction: {
                fields: {
                  numerator: {
                    type: 'int64',
                    comment: 'The numerator in the fraction, e.g. 2 in 2/3.',
                    id: 1
                  },
                  denominator: {
                    type: 'int64',
                    comment: 'The value by which the numerator is divided, e.g. 3 in 2/3.',
                    id: 2
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/interval.proto': {
    nested: {
      google: {
        nested: {
          protobufNested: {
            nested: {
              Timestamp: {
                fields: {
                  seconds: {
                    type: 'int64',
                    id: 1
                  },
                  nanos: {
                    type: 'int32',
                    id: 2
                  }
                }
              }
            }
          },
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/interval;interval',
              java_multiple_files: true,
              java_outer_classname: 'IntervalProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Interval: {
                fields: {
                  startTime: {
                    type: 'google.protobufNested.Timestamp',
                    comment: 'If specified, a Timestamp matching this interval will have to be the same or after the start.',
                    id: 1
                  },
                  endTime: {
                    type: 'google.protobufNested.Timestamp',
                    comment: 'If specified, a Timestamp matching this interval will have to be before the end.',
                    id: 2
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/latlng.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/latlng;latlng',
              java_multiple_files: true,
              java_outer_classname: 'LatLngProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              LatLng: {
                fields: {
                  latitude: {
                    type: 'double',
                    comment: 'The latitude in degrees.\n@Min -90\n@Max +90',
                    id: 1
                  },
                  longitude: {
                    type: 'double',
                    comment: 'The longitude in degrees.\n@Min -180\n@Max +180',
                    id: 2
                  }
                },
                comment: 'An object that represents a latitude/longitude pair. This is expressed as a pair of doubles to represent degrees latitude and degrees longitude. Unless specified otherwise, this must conform to the <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84 standard</a>. Values must be within normalized ranges.',
              }
            }
          }
        }
      }
    }
  },
  'google/type/localized_text.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/localized_text;localized_text',
              java_multiple_files: true,
              java_outer_classname: 'LocalizedTextProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              LocalizedText: {
                fields: {
                  text: {
                    type: 'string',
                    comment: 'Localized string in the language corresponding to \'language_code\'',
                    id: 1
                  },
                  languageCode: {
                    type: 'string',
                    comment: 'The text\'s BCP-47 language code, such as "en-US" or "sr-Latn".\n@Example en-US\n@Example sr-Latn',
                    id: 2
                  }
                },
                comment: 'Localized variant of a text in a particular language.'
              }
            }
          }
        }
      }
    }
  },
  'google/type/money.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/money;money',
              java_multiple_files: true,
              java_outer_classname: 'MoneyProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Money: {
                fields: {
                  currencyCode: {
                    type: 'string',
                    comment: 'The three-letter currency code defined in ISO 4217.\n@Example USD\n@Example EUR',
                    id: 1
                  },
                  units: {
                    type: 'int64',
                    comment: 'The whole units of the amount.',
                    id: 2
                  },
                  nanos: {
                    type: 'int32',
                    comment: 'Number of nano (10^-9) units of the amount',
                    id: 3
                  }
                },
                comment: 'Represents an amount of money with its currency type.',
              }
            }
          }
        }
      }
    }
  },
  'google/type/month.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              go_package: 'google.golang.org/genproto/googleapis/type/month;month',
              java_multiple_files: true,
              java_outer_classname: 'MonthProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Month: {
                values: {
                  MONTH_UNSPECIFIED: 0,
                  JANUARY: 1,
                  FEBRUARY: 2,
                  MARCH: 3,
                  APRIL: 4,
                  MAY: 5,
                  JUNE: 6,
                  JULY: 7,
                  AUGUST: 8,
                  SEPTEMBER: 9,
                  OCTOBER: 10,
                  NOVEMBER: 11,
                  DECEMBER: 12
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/phone_number.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/phone_number;phone_number',
              java_multiple_files: true,
              java_outer_classname: 'PhoneNumberProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              PhoneNumber: {
                oneofs: {
                  kind: {
                    oneof: [
                      'e164Number',
                      'shortCode'
                    ]
                  }
                },
                fields: {
                  e164Number: {
                    type: 'string',
                    id: 1
                  },
                  shortCode: {
                    type: 'ShortCode',
                    id: 2
                  },
                  extension: {
                    type: 'string',
                    id: 3
                  }
                },
                nested: {
                  ShortCode: {
                    fields: {
                      regionCode: {
                        type: 'string',
                        id: 1
                      },
                      number: {
                        type: 'string',
                        id: 2
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'google/type/postal_address.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/postaladdress;postaladdress',
              java_multiple_files: true,
              java_outer_classname: 'PostalAddressProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              PostalAddress: {
                fields: {
                  revision: {
                    type: 'int32',
                    comment: 'The schema revision of the `PostalAddress`. This must be set to 0, which is the latest revision.\n@Min 0\n@Max 0\n@Default 0',
                    id: 1
                  },
                  regionCode: {
                    type: 'string',
                    comment: 'CLDR region code of the country/region of the address. This is never inferred and it is up to the user to ensure the value is correct. See http://cldr.unicode.org/ and http://www.unicode.org/cldr/charts/30/supplemental/territory_information.html for details.\n@Example CH',
                    id: 2
                  },
                  languageCode: {
                    type: 'string',
                    comment: 'BCP-47 language code of the contents of this address (if known). This is often the UI language of the input form or is expected to match one of the languages used in the address country/region, or their transliterated equivalents. This can affect formatting in certain countries, but is not critical to the correctness of the data and will never affect any validation or other non-formatting related operations.\n@Example zh-Hant\n@Example ja\n@Example ja-Latn\n@Example en',
                    id: 3
                  },
                  postalCode: {
                    type: 'string',
                    comment: 'Postal code of the address. Not all countries use or require postal codes to be present, but where they are used, they may trigger additional validation with other parts of the address (e.g. state/zip validation in the U.S.A.).\n@Example 3600',
                    id: 4
                  },
                  sortingCode: {
                    type: 'string',
                    comment: 'Additional, country-specific, sorting code. This is not used in most regions. Where it is used, the value is either a string like "CEDEX", optionally followed by a number (e.g. "CEDEX 7"), or just a number alone, representing the "sector code" (Jamaica), "delivery area indicator" (Malawi) or "post office indicator" (e.g. Côte d\'Ivoire).\n@Example CEDEX 7',
                    id: 5
                  },
                  administrativeArea: {
                    type: 'string',
                    comment: 'Highest administrative subdivision which is used for postal addresses of a country or region. For example, this can be a state, a province, an oblast, or a prefecture. Specifically, for Spain this is the province and not the autonomous community (e.g. "Barcelona" and not "Catalonia"). Many countries don\'t use an administrative area in postal addresses. E.g. in Switzerland this should be left unpopulated.',
                    id: 6
                  },
                  locality: {
                    type: 'string',
                    comment: 'Generally refers to the city/town portion of the address. Examples: US city, IT comune, UK post town. In regions of the world where localities are not well defined or do not fit into this structure well, leave locality empty and use address_lines.',
                    id: 7
                  },
                  sublocality: {
                    type: 'string',
                    comment: 'Sublocality of the address. For example, this can be neighborhoods, boroughs, districts.',
                    id: 8
                  },
                  addressLines: {
                    rule: 'repeated',
                    type: 'string',
                    comment: 'Unstructured address lines describing the lower levels of an address. Because values in address_lines do not have type information and may sometimes contain multiple values in a single field (e.g. "Austin, TX")',
                    id: 9
                  },
                  recipients: {
                    rule: 'repeated',
                    type: 'string',
                    comment: 'The recipient at the address. This field may, under certain circumstances, contain multiline information. For example, it might contain "care of" information.',
                    id: 10
                  },
                  organization: {
                    type: 'string',
                    comment: 'The name of the organization at the address.',
                    id: 11
                  }
                },
                comment: 'Represents a postal address, e.g. for postal delivery or payments addresses. Given a postal address, a postal service can deliver items to a premise, P.O. Box or similar. It is not intended to model geographical locations (roads, towns, mountains).',
              }
            }
          }
        }
      }
    }
  },
  'google/type/quaternion.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/quaternion;quaternion',
              java_multiple_files: true,
              java_outer_classname: 'QuaternionProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              Quaternion: {
                fields: {
                  x: {
                    type: 'double',
                    id: 1
                  },
                  y: {
                    type: 'double',
                    id: 2
                  },
                  z: {
                    type: 'double',
                    id: 3
                  },
                  w: {
                    type: 'double',
                    id: 4
                  }
                }
              }
            },
            comment: 'A quaternion is defined as the quotient of two directed lines in a three-dimensional space or equivalently as the quotient of two Euclidean vectors (https://en.wikipedia.org/wiki/Quaternion).',
          }
        }
      }
    }
  },
  'google/type/timeofday.proto': {
    nested: {
      google: {
        nested: {
          type: {
            options: {
              cc_enable_arenas: true,
              go_package: 'google.golang.org/genproto/googleapis/type/timeofday;timeofday',
              java_multiple_files: true,
              java_outer_classname: 'TimeOfDayProto',
              java_package: GOOGLE_TYPE,
              objc_class_prefix: 'GTP'
            },
            nested: {
              TimeOfDay: {
                fields: {
                  hours: {
                    type: 'int32',
                    id: 1
                  },
                  minutes: {
                    type: 'int32',
                    id: 2
                  },
                  seconds: {
                    type: 'int32',
                    id: 3
                  },
                  nanos: {
                    type: 'int32',
                    id: 4
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'validate/validate.proto': {},
  'buf/validate/validate.proto': {},
};
