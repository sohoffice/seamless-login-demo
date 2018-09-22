package services

import javax.inject.{Inject, Singleton}
import play.api.cache.AsyncCacheApi

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class UserService @Inject()(
  cacheApi: AsyncCacheApi
)(implicit ec: ExecutionContext) extends SeamlessLoginConstants {

  def createUser: Future[Int] = {
    this.synchronized {
      cacheApi.get[mutable.Buffer[Int]](USERS) map {
        case Some(users) =>
          val maxUserId = users.foldLeft(0) { (memo, cur) =>
            if(cur > memo) {
              cur
            } else {
              memo
            }
          }

          val nextUserId = maxUserId + 1

          users += nextUserId

          nextUserId
        case _ =>
          val users = mutable.Buffer[Int](
            1
          )
          cacheApi.set(USERS, users)

          1
      }
    }
  }
}
