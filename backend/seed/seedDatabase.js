const fs = require('fs')
const path = require('path')

const User = require('../models/User')
const Customer = require('../models/Customer')
const Profile = require('../models/Profile')

const customersPath = path.join(__dirname, '..', 'data', 'customers.json')

async function seedDatabase() {
  const existingUser = await User.findOne({ username: 'matchmaker' })
  const user = existingUser
    ? existingUser
    : await User.create({
      username: 'matchmaker',
      password: 'matchmaker',
      name: 'Aarav Matchmaker',
    })

  const customerCount = await Customer.countDocuments()
  if (customerCount === 0) {
    const customersSeed = JSON.parse(fs.readFileSync(customersPath, 'utf-8'))
    const payload = customersSeed.map((item) => ({
      ...item,
      externalId: item.id,
      matchmakerId: user._id,
    }))
    await Customer.insertMany(payload)
  }

  const profileCount = await Profile.countDocuments()
  if (profileCount === 0) {
    const profiles = generateProfiles(120)
    await Profile.insertMany(profiles)
  }
}

function generateProfiles(countPerGender) {
  const femaleFirst = ['Aisha', 'Diya', 'Ishita', 'Kavya', 'Meera', 'Nisha', 'Pooja', 'Riya', 'Sara', 'Tara']
  const maleFirst = ['Aditya', 'Dev', 'Harsh', 'Ishan', 'Karan', 'Manish', 'Neeraj', 'Om', 'Rohan', 'Yash']
  const lastNames = ['Gupta', 'Sharma', 'Patel', 'Reddy', 'Kapoor', 'Iyer', 'Das', 'Jain']
  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur', 'Kolkata']
  const degrees = ['B.Tech', 'BBA', 'B.Com', 'B.Sc', 'BA', 'MBA']
  const companies = ['NovaCore', 'BrightWave', 'PeakLine', 'UrbanNest', 'ClearSky', 'SparkBridge']
  const designations = ['Analyst', 'Engineer', 'Consultant', 'Manager', 'Designer', 'Lead']
  const languages = ['Hindi', 'English', 'Marathi', 'Kannada', 'Tamil', 'Telugu', 'Punjabi']
  const castes = ['Brahmin', 'Kshatriya', 'Baniya', 'Maratha', 'Nair', 'Reddy', 'Jain']
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh']
  const kidPrefs = ['Yes', 'No', 'Maybe']
  const petPrefs = ['Yes', 'No', 'Maybe']
  const relocatePrefs = ['Yes', 'No', 'Maybe']

  const profiles = []

  for (let i = 0; i < countPerGender; i += 1) {
    profiles.push(
      buildProfile({
        gender: 'Female',
        firstName: femaleFirst[i % femaleFirst.length],
        lastName: lastNames[i % lastNames.length],
        age: 22 + (i % 12),
        heightCm: 150 + (i % 20),
        income: 700000 + i * 12000,
        city: cities[i % cities.length],
        degree: degrees[i % degrees.length],
        currentCompany: companies[i % companies.length],
        designation: designations[i % designations.length],
        languagesKnown: [languages[i % languages.length], 'English'],
        caste: castes[i % castes.length],
        religion: religions[i % religions.length],
        wantKids: kidPrefs[i % kidPrefs.length],
        openToRelocate: relocatePrefs[i % relocatePrefs.length],
        openToPets: petPrefs[i % petPrefs.length],
      })
    )
  }

  for (let i = 0; i < countPerGender; i += 1) {
    profiles.push(
      buildProfile({
        gender: 'Male',
        firstName: maleFirst[i % maleFirst.length],
        lastName: lastNames[i % lastNames.length],
        age: 25 + (i % 12),
        heightCm: 165 + (i % 22),
        income: 900000 + i * 15000,
        city: cities[(i + 2) % cities.length],
        degree: degrees[(i + 1) % degrees.length],
        currentCompany: companies[(i + 1) % companies.length],
        designation: designations[(i + 2) % designations.length],
        languagesKnown: [languages[(i + 3) % languages.length], 'English'],
        caste: castes[(i + 1) % castes.length],
        religion: religions[(i + 1) % religions.length],
        wantKids: kidPrefs[(i + 1) % kidPrefs.length],
        openToRelocate: relocatePrefs[(i + 1) % relocatePrefs.length],
        openToPets: petPrefs[(i + 1) % petPrefs.length],
      })
    )
  }

  return profiles
}

function buildProfile(profile) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    dateOfBirth: dateFromAge(profile.age),
    country: 'India',
    city: profile.city,
    heightCm: profile.heightCm,
    email: `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@example.com`,
    phone: '+91-90000-00000',
    undergraduateCollege: 'State University',
    degree: profile.degree,
    income: profile.income,
    currentCompany: profile.currentCompany,
    designation: profile.designation,
    maritalStatus: 'Never Married',
    languagesKnown: profile.languagesKnown,
    siblings: '1 sibling',
    caste: profile.caste,
    religion: profile.religion,
    wantKids: profile.wantKids,
    openToRelocate: profile.openToRelocate,
    openToPets: profile.openToPets,
  }
}

function dateFromAge(age) {
  const today = new Date()
  const year = today.getFullYear() - age
  const month = ((age * 7) % 12) + 1
  const day = ((age * 13) % 28) + 1
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

module.exports = seedDatabase
