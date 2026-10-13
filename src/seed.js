import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Treatment from './models/Treatment.js';
import Appointment from './models/Appointment.js';

dotenv.config();

const baseTreatments = [
  // FACE / SKIN
  { name: 'Hydrafacials / Medifacials', slug: 'hydrafacials-medifacials', category: 'FACE / SKIN' },
  { name: 'Laser Facial Toning (for Glow / Whitening / Acne scars / Korean Glass Skin)', slug: 'laser-facial-toning', category: 'FACE / SKIN' },
  { name: 'De-Tan / De-pigmentation', slug: 'de-tan-de-pigmentation', category: 'FACE / SKIN' },
  { name: 'Tattoo Removal', slug: 'tattoo-removal', category: 'FACE / SKIN' },
  { name: 'Scar or mole removal', slug: 'scar-or-mole-removal', category: 'FACE / SKIN' },
  { name: 'Glass-skin Clear Axilla / Neck / Elbow / Knee', slug: 'glass-skin-clear-body', category: 'FACE / SKIN' },
  { name: 'Skin Tightening / Skin Lifting / Anti-ageing', slug: 'skin-tightening-lifting-anti-ageing', category: 'FACE / SKIN' },
  { name: 'Skin boosters / Fillers / Botox / Threads', slug: 'skin-boosters-fillers-botox-threads', category: 'FACE / SKIN' },
  { name: 'Lip fillers or boosters', slug: 'lip-fillers-or-boosters', category: 'FACE / SKIN' },
  { name: 'Face lift / Jawline sculpting / Double Chin', slug: 'face-lift-jawline-sculpting-double-chin', category: 'FACE / SKIN' },

  // BODY & LONGEVITY
  { name: 'Laser Hair Reduction', slug: 'laser-hair-reduction', category: 'BODY & LONGEVITY' },
  { name: 'Muscle contouring (Abs, buttock lift, Biceps/Triceps/Thighs/calf)', slug: 'muscle-contouring', category: 'BODY & LONGEVITY' },
  { name: 'Weight loss programs', slug: 'weight-loss-programs', category: 'BODY & LONGEVITY' },
  { name: 'Bridal Packages', slug: 'bridal-packages', category: 'BODY & LONGEVITY' },
  { name: 'Mommy makeover / Post-partum Recovery', slug: 'mommy-makeover-post-partum-recovery', category: 'BODY & LONGEVITY' },
  { name: 'Intravenous Longevity drips', slug: 'intravenous-longevity-drips', category: 'BODY & LONGEVITY' },
  { name: 'Complete Body Analysis / Prophylactic Health Packages', slug: 'complete-body-analysis-prophylactic-health-packages', category: 'BODY & LONGEVITY' },

  // HAIR & INTIMATE WELLNESS
  { name: 'Hair Regrowth / Regeneration', slug: 'hair-regrowth-regeneration', category: 'HAIR & INTIMATE WELLNESS' },
  { name: 'Intimacy Rejuvenation', slug: 'intimacy-rejuvenation', category: 'HAIR & INTIMATE WELLNESS' },
  { name: 'Sexual wellness (Premature ejaculation, Erectile dysfunction, Stapler circumcision)', slug: 'sexual-wellness', category: 'HAIR & INTIMATE WELLNESS' },

  // SURGERY & GASTRO
  { name: 'Laser surgery for Pilonidal sinus', slug: 'laser-surgery-pilonidal-sinus', category: 'SURGERY & GASTRO' },
  { name: 'Gastro-intestinal problems', slug: 'gastro-intestinal-problems', category: 'SURGERY & GASTRO' },
  { name: 'Liver, Gallbladder Stone, Gastro-oesophageal reflux disease, Pancreas, Acidity, Dyspepsia, Appendix', slug: 'liver-gallbladder-gerd-pancreas', category: 'SURGERY & GASTRO' },
  { name: 'Hernia, Abdominal Wall Reconstruction', slug: 'hernia-abdominal-wall-reconstruction', category: 'SURGERY & GASTRO' },
  { name: 'Bariatric (Weight-loss, Diabetes Surgery)', slug: 'bariatric-weight-loss-diabetes-surgery', category: 'SURGERY & GASTRO' },
  { name: 'Laser Proctology (Piles, Fissure, Fistula)', slug: 'laser-proctology-piles-fissure-fistula', category: 'SURGERY & GASTRO' },
  { name: 'Robotic Surgery', slug: 'robotic-surgery', category: 'SURGERY & GASTRO' }
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
