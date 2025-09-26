export class UserDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.firstName = user.first_name;
    this.lastName = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.cart = user.cart || null; // <-- mantenemos el cart
  }
}