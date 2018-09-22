package forms

import play.api.data.Forms._
import play.api.data._

case class SignInData(
  handle: String
)

object SignInData {
  val signInForm = Form(
    mapping(
      "handle" -> nonEmptyText
    )(SignInData.apply)(SignInData.unapply)
  )
}
