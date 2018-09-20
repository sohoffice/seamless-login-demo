package actors

import akka.actor.ActorRef
import akka.event.{EventBus, LookupClassification}
import javax.inject.Inject

class AuthEventBus @Inject()() extends EventBus with LookupClassification {
  type Event = AuthEventBus.AuthEvent
  type Classifier = String
  type Subscriber = ActorRef

  override protected def mapSize(): Int = 128

  override protected def compareSubscribers(a: ActorRef, b: ActorRef): Int = a.compareTo(b)

  override protected def classify(event: AuthEventBus.AuthEvent): String = "auth-event-bus"

  override protected def publish(event: AuthEventBus.AuthEvent, subscriber: ActorRef): Unit = {
    subscriber ! event
  }
}

object AuthEventBus {

  trait AuthEvent

  /** Use this to trigger the start of auth flow for the given handle.
    *
    * @param handle
    */
  case class Start(
    handle: String
  ) extends AuthEvent

  /** Conclude the auth flow for a handle
    *
    * @param handle
    */
  case class Finalize(
    handle: String
  ) extends AuthEvent

  /** Indicate the user was authenticated for a handle
    *
    * @param handle
    */
  case class Authenticated(
    handle: String
  ) extends AuthEvent

}
