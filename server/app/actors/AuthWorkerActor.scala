package actors

import akka.actor.Actor
import javax.inject.Inject
import org.slf4j.{LoggerFactory, MarkerFactory}
import services.UserService

import scala.concurrent.ExecutionContext

class AuthWorkerActor @Inject()(
  eventBus: AuthEvents,
  userService: UserService
)(implicit ec: ExecutionContext) extends Actor {

  override def receive: Receive = {
    case AuthEvents.Start(handle) =>
      logger.info(marker, s"Start auth flow for $handle")
    case AuthEvents.Authenticated(handle) =>
      logger.info(marker, s"User is authenticated")
      this.userService.createUser map { userId =>
        logger.info(marker, s"User $userId was created.")
        val msg = AuthEvents.UserToken(handle, userId, userId.toString)
        logger.debug(marker, s"Publishing user token message: $msg")
        eventBus.publish(msg)

        sender() ! "ok"
      }
    case AuthEvents.Finalize(handle) =>
      logger.info(marker, s"Finalize auth flow for $handle")
    case x =>
      logger.debug(s"auth-worker received unknown event: $x")
  }


  override def postStop(): Unit = {
    // unregister myself from auth-event-bus
    eventBus.unsubscribe(self)
    super.postStop()
  }

  private val marker = MarkerFactory.getMarker(self.path.name)
  private val logger = LoggerFactory.getLogger(this.getClass)
}
