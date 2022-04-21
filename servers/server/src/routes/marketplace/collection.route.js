import express from 'express'

import * as crudTemplate from '../_template/crud.route'
import { collectionService } from '../../services'
import { collectionValidation } from '../../validations'

const router = express.Router()

crudTemplate.getterRoute(router, collectionValidation, collectionService, 'id')
crudTemplate.creatorRoute(router, collectionValidation, collectionService)
crudTemplate.deleterRoute(router, collectionValidation, collectionService, 'id')
crudTemplate.updaterRoute(router, collectionValidation, collectionService, 'id')

export default router
