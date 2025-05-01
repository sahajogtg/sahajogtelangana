import vine from "@vinejs/vine";

export const registerSchema = vine.object({
  name: vine.string().trim().minLength(2).maxLength(30),
  email: vine.string().email(),
  password: vine.string().minLength(6).maxLength(20).confirmed(),
});

export const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(6),
});

export const corporateRegisterSchema = vine.object({
  companyName: vine.string().trim().minLength(2).maxLength(100),
  contactPerson: vine.object({
    name: vine.string().trim().minLength(2).maxLength(50),
    position: vine.string().trim().minLength(2).maxLength(50),
    email: vine.string().email(),
    phone: vine.string().trim().regex(/^\+?[0-9]{6,15}$/)
  }),
  officeAddress: vine.object({
    street: vine.string().trim().minLength(5).maxLength(100),
    city: vine.string().trim().minLength(2).maxLength(50),
    state: vine.string().trim().minLength(2).maxLength(50),
  }),
  preferredProgramDate: vine.string().optional(),
  additionalRemarks: vine.string().trim().maxLength(500).optional()
});

export const contactSchema = vine.object({
  name: vine.string().trim().minLength(2).maxLength(30),
  email: vine.string().email(),
  phoneNumber: vine.string().trim().regex(/^\+?[\d\s]{10,15}$/),
  message: vine.string().trim().maxLength(500)
})

export const seekerSchema = vine.object({
  name: vine.string().trim().minLength(2).maxLength(30),
  city: vine.string().trim().minLength(2).maxLength(50),
  phoneNumber: vine.string().trim().regex(/^\+?[\d\s]{10,15}$/),
})

export const centerSchema = vine.object({
  address: vine.string().trim().minLength(5).maxLength(200),
  day: vine.string().trim().minLength(3).maxLength(10),
  time: vine.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d(AM|PM)$/),
  contactPersons: vine.string().trim().minLength(2).maxLength(100),
  contactNumbers: vine.string().trim().regex(/^[\d, ]+$/),
});