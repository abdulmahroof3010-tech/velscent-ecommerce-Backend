const z = require("zod");

const offerValidation = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),

  discount_percentage: z.coerce.number({
    invalid_type_error: "Discount must be a number"
  })
    .min(1, "Minimum discount is 1%")
    .max(100, "Maximum discount is 100%"),

  applicableType: z.string().trim().min(2, "Type must be valid"),

  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),

  isActive: z.boolean().optional()
})
.transform((data) => ({
  ...data,
  startDate: new Date(data.startDate),
  endDate: new Date(data.endDate)
}))
.refine((data) => !isNaN(data.startDate.getTime()), {
  message: "Invalid start date",
  path: ["startDate"]
})
.refine((data) => !isNaN(data.endDate.getTime()), {
  message: "Invalid end date",
  path: ["endDate"]
})
.refine((data) => data.startDate < data.endDate, {
  message: "Start date must be before end date",
  path: ["endDate"]
});


const updateOfferValidation = z.object({
  name: z.string().trim().min(3).optional(),

  discount_percentage: z.coerce.number()
    .min(1)
    .max(100)
    .optional(),

  applicableType: z.string().trim().min(2).optional(),

  startDate: z.string().optional(),
  endDate: z.string().optional(),

  isActive: z.boolean().optional()
})
.transform((data) => ({
  ...data,
  startDate: data.startDate ? new Date(data.startDate) : undefined,
  endDate: data.endDate ? new Date(data.endDate) : undefined
}))
.refine((data) => {
  if (data.startDate && isNaN(data.startDate.getTime())) return false;
  return true;
}, {
  message: "Invalid start date",
  path: ["startDate"]
})
.refine((data) => {
  if (data.endDate && isNaN(data.endDate.getTime())) return false;
  return true;
}, {
  message: "Invalid end date",
  path: ["endDate"]
})
.refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
}, {
  message: "Start date must be before end date",
  path: ["endDate"]
});


module.exports = { offerValidation, updateOfferValidation };