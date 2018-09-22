package actors

import akka.actor.ActorRef
import akka.event.{EventBus, LookupClassification}
import javax.inject.{Inject, Singleton}
import org.slf4j.LoggerFactory

@Singleton
class AuthEvents @Inject()() extends EventBus with LookupClassification {
  type Event = AuthEvents.AuthEvent
  type Classifier = String
  type Subscriber = ActorRef

  override protected def mapSize(): Int = 128

  override protected def compareSubscribers(a: ActorRef, b: ActorRef): Int = a.compareTo(b)

  override protected def classify(event: AuthEvents.AuthEvent): String = "auth-event-bus"

  override protected def publish(event: AuthEvents.AuthEvent, subscriber: ActorRef): Unit = {
    logger.trace(s"auth-event-bus publishing $event")
    subscriber ! event
  }

  val logger = LoggerFactory.getLogger(this.getClass)
}

object AuthEvents {

  trait AuthEvent

  /** signal the start of auth flow
    *
    * @param handle
    */
  case class Start(
    handle: String
  ) extends AuthEvent

  /** signal the end of auth flow
    *
    * @param handle
    */
  case class Finalize(
    handle: String
  ) extends AuthEvent

  /** Indicate the user was authenticated for a handle.
    * Sent by auth provider callback endpoint.
    *
    * @param handle
    */
  case class Authenticated(
    handle: String
  ) extends AuthEvent

  /**
    * The Authenticated event was handled.
    * Local user was created or retrieved.
    *
    * @param handle
    * @param userId
    * @param token For demo purpose, the token equals to userId.toString
    */
  case class UserToken(
    handle: String,
    userId: Int,
    token: String
  ) extends AuthEvent

}
