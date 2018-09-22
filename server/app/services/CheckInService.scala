package services

import java.time.Instant

import io.CheckInProtocols.CheckInRecord
import javax.inject.{Inject, Singleton}
import play.api.cache.AsyncCacheApi

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class CheckInService @Inject()(
  cacheApi: AsyncCacheApi
)(implicit ec: ExecutionContext) extends SeamlessLoginConstants {

  def get: Future[Seq[CheckInRecord]] = cacheApi.get[mutable.Buffer[CheckInRecord]](CHECKINS).map {
    case Some(records) =>
      records
    case _ =>
      Nil
  }

  def checkIn(userId: Int): Future[Unit] = this.synchronized {
    val rec = CheckInRecord(
      userId, Instant.now
    )
    cacheApi.get[mutable.Buffer[CheckInRecord]](CHECKINS).map {
      case Some(records) =>
        records += rec
      case _ =>
        val records = mutable.Buffer(
          rec
        )
        cacheApi.set(CHECKINS, records)
    }
  }
}
