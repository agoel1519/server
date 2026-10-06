import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Treatment from './models/Treatment.js';
import Appointment from './models/Appointment.js';

dotenv.config();

const baseTreatments = [
  // FACE / SKIN
  { name: 'SCAR', slug: 'scar', category: 'FACE / SKIN' },
  { 
    name: 'CHEMICAL PEELS', 
    slug: 'chemical-peels', 
    category: 'FACE / SKIN',
    title: 'CHEMICAL PEELS IN MUMBAI',
    introText: 'Chemical peels represent a cornerstone in clinical dermatology, offering a refined, evidence-based approach to skin resurfacing. By gently lifting damaged cellular layers, our medical-grade formulations reveal an intensely radiant, smoother, and deeply clarified complexion.',
    contentSection: {
      heading: 'WHAT ARE CLINICAL CHEMICAL PEELS?',
      text: 'A chemical peel is an advanced dermatological procedure utilizing physician-calibrated fruit acids, AHAs, BHAs, and trichloroacetic acids (TCA) to dissolve cellular bonds binding aged keratin.',
      image: '/treatments/treatment-skin.jpg'
    }
  },
  { name: 'DERMA MELAN PEEL', slug: 'derma-melan-peel', category: 'FACE / SKIN' },
  { name: 'PLASMA PEN', slug: 'plasma-pen', category: 'FACE / SKIN' },
  { name: 'PIGMENT LASER', slug: 'pigment-laser', category: 'FACE / SKIN' },
  { name: 'COSMELAN PEEL', slug: 'cosmelan-peel', category: 'FACE / SKIN' },
  { name: 'MEDI-FACIAL', slug: 'medi-facial', category: 'FACE / SKIN' },
  { name: 'PEEL + WHITENING', slug: 'peel-whitening', category: 'FACE / SKIN' },
  { name: 'SKIN BOOSTER', slug: 'skin-booster', category: 'FACE / SKIN' },
  { name: 'HIFU FACIAL', slug: 'hifu-facial', category: 'FACE / SKIN' },
  { name: 'TATTOO REMOVAL', slug: 'tattoo-removal', category: 'FACE / SKIN' },
  { name: 'KELOID TREATMENT', slug: 'keloid-treatment', category: 'FACE / SKIN' },
  { name: 'THREADS', slug: 'threads', category: 'FACE / SKIN' },
  { name: 'BOTOX', slug: 'botox', category: 'FACE / SKIN' },
  { name: 'WART REMOVAL', slug: 'wart-removal', category: 'FACE / SKIN' },
  { name: 'SKIN POLISHING', slug: 'skin-polishing', category: 'FACE / SKIN' },
  { name: 'MILIA EXTRACTION', slug: 'milia-extraction', category: 'FACE / SKIN' },
  { name: 'FILLER', slug: 'filler', category: 'FACE / SKIN' },
  { name: 'MOLE REMOVAL', slug: 'mole-removal', category: 'FACE / SKIN' },
  { name: 'PEELS (ALL)', slug: 'peels', category: 'FACE / SKIN' },
  { name: 'EXION MNRF (BTL)', slug: 'exion-mnrf', category: 'FACE / SKIN' },
  { name: 'BIOREPEEL', slug: 'biorepeel', category: 'FACE / SKIN' },
  { name: 'YELLOW PEEL', slug: 'yellow-peel', category: 'FACE / SKIN' },
  { name: 'EXION FACE (BTL)', slug: 'exion-face', category: 'FACE / SKIN' },
  { name: 'EMFACE (BTL)', slug: 'emface', category: 'FACE / SKIN' },
  { name: 'MICROBLADING', slug: 'microblading', category: 'FACE / SKIN' },
  { name: 'DERMA PEN', slug: 'derma-pen', category: 'FACE / SKIN' },
  { name: 'LASER / FOTONA', slug: 'laser-fotona', category: 'FACE / SKIN' },
  { name: 'MICRO DERMABRASION', slug: 'micro-dermabrasion', category: 'FACE / SKIN' },
  { name: 'MANDELIC PEEL', slug: 'mandelic-peel', category: 'FACE / SKIN' },
  { name: 'MOLLUSCUM REMOVAL', slug: 'molluscum-removal', category: 'FACE / SKIN' },
  { name: 'ULTHERAPY PRIME', slug: 'ultherapy-prime', category: 'FACE / SKIN' },

  // BODY
  { name: 'EMSCULPT NEO', slug: 'emsculpt-neo', category: 'BODY' },
  { name: 'EMERALD LASER', slug: 'emerald-laser', category: 'BODY' },
  { name: 'BALLANCER PRO', slug: 'ballancer-pro', category: 'BODY' },
  { name: 'EXION - RF', slug: 'exion-rf', category: 'BODY' },
  { name: 'BODY CONTOURING', slug: 'body-contouring', category: 'BODY' },
  { name: 'INCH LOSS', slug: 'inch-loss', category: 'BODY' },
  { name: 'COOLSCULPTING', slug: 'coolsculpting', category: 'BODY' },

  // IV THERAPY
  { name: 'NAD+ IV DRIP', slug: 'nad-plus-iv-drip', category: 'IV THERAPY' },
  { name: 'LIMITLESS', slug: 'limitless-iv', category: 'IV THERAPY' },
  { name: 'SIGNATURE', slug: 'signature-iv', category: 'IV THERAPY' },
  { name: 'FITNESS', slug: 'fitness-iv', category: 'IV THERAPY' },
  { name: 'INSTAGLO', slug: 'instaglo-iv', category: 'IV THERAPY' },
  { name: 'HAIR HEALTH', slug: 'hair-health-iv', category: 'IV THERAPY' },
  { name: 'REWIND', slug: 'rewind-iv', category: 'IV THERAPY' },
  { name: 'HANGOVER', slug: 'hangover-iv', category: 'IV THERAPY' },
  { name: 'SHIELD', slug: 'shield-iv', category: 'IV THERAPY' },
  { name: 'SUPER WOMAN', slug: 'super-woman-iv', category: 'IV THERAPY' },

  // HAIR
  { name: 'HAIR CONSULTATION', slug: 'hair-consultation', category: 'HAIR' },
  { name: 'HAIR REGROWTH', slug: 'hair-regrowth', category: 'HAIR' },
  { name: 'IV THERAPY FOR HAIRFALL', slug: 'iv-therapy-for-hairfall', category: 'HAIR' },
  { name: 'DERMAROLLER', slug: 'dermaroller', category: 'HAIR' },
  { name: 'HAIR GROWTH LASERS', slug: 'hair-growth-lasers', category: 'HAIR' },
  { name: 'SCALP MICRO PIGMENTATION', slug: 'scalp-micro-pigmentation', category: 'HAIR' },
  { name: 'DERMAPEN', slug: 'dermapen', category: 'HAIR' },
  { name: 'EXOSOMES & BIOSTEMCELLS', slug: 'exosomes-biostemcells', category: 'HAIR' },
  { name: 'FUE', slug: 'fue', category: 'HAIR' },
  { name: 'HIGH-DENSITY FUE', slug: 'high-density-fue', category: 'HAIR' },
  { name: 'EYEBROW TRANSPLANT', slug: 'eyebrow-transplant', category: 'HAIR' },
  { name: 'MEGA HAIR TRANSPLANT', slug: 'mega-hair-transplant', category: 'HAIR' },
  { name: 'BEARD TRANSPLANT', slug: 'beard-transplant', category: 'HAIR' },
  { name: 'HAIR FUE - NO ROOT TOUCH', slug: 'hair-fue-no-root-touch', category: 'HAIR' },

  // AESTHETIC GYNAECOLOGY
  { name: 'VULVO-VAGINAL', slug: 'vulvo-vaginal', category: 'AESTHETIC GYNAECOLOGY' },
  { name: 'EMSELLA', slug: 'emsella', category: 'AESTHETIC GYNAECOLOGY' },
  { name: 'ORGASM SHOT', slug: 'orgasm-shot', category: 'AESTHETIC GYNAECOLOGY' },
  { name: 'VAGINISMUS', slug: 'vaginismus', category: 'AESTHETIC GYNAECOLOGY' },
  { name: 'VULVAR AUGMENTATION', slug: 'vulvar-augmentation', category: 'AESTHETIC GYNAECOLOGY' },
  { name: 'LABIAPLASTY', slug: 'labiaplasty', category: 'AESTHETIC GYNAECOLOGY' },

  // LASER HAIR REMOVAL
  { name: 'LASER HAIR REMOVAL', slug: 'laser-hair-removal', category: 'LASER HAIR REMOVAL' }
];

const sampleAppointments = [
  {
    name: 'Ananya Sharma',
    phone: '+91 98201 44521',
    email: 'ananya.s@gmail.com',
    treatment: 'CHEMICAL PEELS IN MUMBAI',
    preferredDate: '2026-10-12',
    preferredTime: '11:30 AM',
    notes: 'Interested in reducing acne scarring and skin brightening.',
    status: 'confirmed'
  },
  {
    name: 'Rohit Mehra',
    phone: '+91 98112 33490',
    email: 'rohit.mehra@outlook.com',
    treatment: 'NAD+ IV DRIP IN MUMBAI',
    preferredDate: '2026-10-15',
    preferredTime: '03:00 PM',
    notes: 'Looking for longevity protocol and energy enhancement.',
    status: 'new'
  },
  {
    name: 'Pooja Kapoor',
    phone: '+91 99304 88219',
    email: 'pooja.kapoor@yahoo.com',
    treatment: 'EMFACE (BTL) IN MUMBAI',
    preferredDate: '2026-10-18',
    preferredTime: '01:00 PM',
    notes: 'Consultation for non-surgical facial lifting.',
    status: 'confirmed'
  }
];

const runSeed = async () => {
  await connectDB();
  console.log('🌱 Starting MongoDB Atlas seeding...');

  try {
    for (const item of baseTreatments) {
      const title = item.title || `${item.name} IN MUMBAI`;
      const doc = {
        slug: item.slug,
        title,
        category: item.category,
        breadcrumb: `HOME / TREATMENTS / ${item.category} / ${item.name}`,
        introText: item.introText || `Experience physician-led, evidence-based ${item.name.toLowerCase()} at Aevora Aesthetics. Formulated to deliver natural, clinically backed results.`,
        contentSection: item.contentSection || {
          heading: `WHAT IS ${item.name}?`,
          text: `${item.name} is a specialized clinical aesthetic protocol customized to your unique anatomical profile and tissue requirements.`,
          image: '/treatments/treatment-skin.jpg'
        },
        accordionSection: {
          heading: `WHY CHOOSE AEVORA FOR ${item.name}`,
          items: [
            { title: 'Physician-Led Protocol', content: 'Administered under the supervision of board-certified clinical aesthetic specialists.' },
            { title: 'US FDA-Cleared Equipment', content: 'Only certified, authentic medical technologies and approved formulations.' }
          ]
        },
        featuresSection: {
          heading: `BENEFITS OF ${item.name}`,
          features: [
            { title: 'Targeted Tissue Renewal', description: 'Supports healthy cell regeneration and dermal vitality.' },
            { title: 'Subtle Aesthetic Harmony', description: 'Yields an effortless, refreshed and natural appearance.' }
          ]
        },
        ctaSection: {
          heading: 'SCHEDULE YOUR CLINICAL EVALUATION',
          text: 'Our senior specialists design personalized protocols to help you achieve your aesthetic goals.'
        },
        faqs: [
          { question: `How many sessions of ${item.name.toLowerCase()} are recommended?`, answer: 'Typically 3 to 6 sessions are recommended based on individual assessment.' },
          { question: 'Is there any downtime?', answer: 'Most patients experience minimal to zero downtime.' }
        ],
        isCustom: false
      };

      await Treatment.findOneAndUpdate(
        { slug: item.slug },
        doc,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${baseTreatments.length} treatments into MongoDB Atlas!`);

    // Seed sample appointments if collection is empty
    const count = await Appointment.countDocuments();
    if (count === 0) {
      await Appointment.insertMany(sampleAppointments);
      console.log(`✅ Seeded ${sampleAppointments.length} sample appointments into MongoDB Atlas!`);
    } else {
      console.log(`ℹ️ Appointments collection already contains ${count} records.`);
    }

    console.log('🎉 MongoDB Atlas Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

runSeed();
