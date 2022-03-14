interface InfluxPoint {
  /**
   * Measurement is the Influx measurement name.
   */
  measurement?: string
  /**
   * Tags is the list of tag values to insert.
   */
  tags: {
    [name: string]: string
  }
  /**
   * Fields is the list of field values to insert.
   */
  fields: {
    [name: string]: any
  }
  /**
   * Timestamp tags this measurement with a date. This can be a Date object,
   * in which case we'll adjust it to the desired precision, or a numeric
   * string or number, in which case it gets passed directly to Influx.
   */
  timestamp?: Date | string | number
}
