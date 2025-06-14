import { Service } from '@summer-js/summer'
import { Pet } from './TestPet'

@Service
export class PetService {
  getPet() {
    return new Pet()
  }
}
