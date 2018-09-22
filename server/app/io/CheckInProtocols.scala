package io

import java.time.Instant

import play.api.libs.json.Json

object CheckInProtocols {

  case class CheckInRecord(
    userId: Int,
    checkedInAt: Instant
  )

  implicit val checkInRecordWrites = Json.writes[CheckInRecord]

}
