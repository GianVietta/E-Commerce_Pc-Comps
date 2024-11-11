export interface Person {
    address: string;
    phoneNumber: string;
    dni: string;
    name: string;
    lastName: string;
  }
  export interface User {
    id: string;
    password: string;
    email: string;
    person: Person;
  }
