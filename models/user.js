import mongoose, { Schema } from 'mongoose';

// Schema فرعي لعنوان الشحن
const addressSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
      required: true,
    },
    governorate: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    buildingNumber: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
    },
    apartment: {
      type: String,
    },
    landmark: {
      type: String, // معلم مميز قريب
    },
    postalCode: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Schema الرئيسي للعميل
const userSchema = new Schema(
  {
    // البيانات الأساسية
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // بيانات الاتصال
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^01[0-2,5]{1}[0-9]{8}$/.test(v); // نمط الهواتف المصرية
        },
        message: 'رقم الهاتف غير صحيح',
      },
    },
    phoneSecondary: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^01[0-2,5]{1}[0-9]{8}$/.test(v);
        },
        message: 'رقم الهاتف الثانوي غير صحيح',
      },
    },

    // البيانات الشخصية
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    nationalId: {
      type: String,
      unique: true,
      sparse: true, // للسماح بقيم null متعددة
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{14}$/.test(v); // الرقم القومي المصري
        },
        message: 'الرقم القومي يجب أن يكون 14 رقماً',
      },
    },

    // العناوين (يمكن أن يكون للعميل عدة عناوين)
    addresses: [addressSchema],

    // تفضيلات الدفع
    preferredPaymentMethod: {
      type: String,
      enum: ['cash', 'card', 'digital_wallet'],
      default: 'cash',
    },

    // بيانات إضافية للشحن
    deliveryInstructions: {
      type: String,
      maxlength: 500,
    },

    // حالة الحساب
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // إحصائيات العميل
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },

    // تاريخ آخر تسجيل دخول
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field للعنوان الافتراضي
userSchema.virtual('defaultAddress').get(function () {
  return this.addresses.find((addr) => addr.isDefault) || this.addresses[0];
});

// Virtual field للاسم الكامل والعنوان
userSchema.virtual('fullAddressString').get(function () {
  const addr = this.defaultAddress;
  if (!addr) return '';

  return `${
    addr.governorate
  }, ${addr.city}, ${addr.district}, ${addr.street}, رقم ${addr.buildingNumber}${addr.floor ? `, الطابق ${addr.floor}` : ''}${addr.apartment ? `, شقة ${addr.apartment}` : ''}`;
});

// Middleware للتأكد من وجود عنوان افتراضي واحد فقط
userSchema.pre('save', function (next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);

    if (defaultAddresses.length === 0) {
      // إذا لم يكن هناك عنوان افتراضي، اجعل الأول افتراضياً
      this.addresses[0].isDefault = true;
    } else if (defaultAddresses.length > 1) {
      // إذا كان هناك أكثر من عنوان افتراضي، اجعل الأول فقط افتراضياً
      this.addresses.forEach((addr, index) => {
        addr.isDefault = index === 0;
      });
    }
  }
  next();
});

// ✅ تحقق آمن من وجود الموديل
const user = mongoose.models?.user || mongoose.model('user', userSchema);

export default user;