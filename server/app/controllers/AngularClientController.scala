package controllers

import javax.inject.Inject

class AngularClientController @Inject()(
  errorHandler: AngularClientErrorHandler,
  meta: AssetsMetadata
) extends AssetsBuilder(errorHandler, meta){
}
