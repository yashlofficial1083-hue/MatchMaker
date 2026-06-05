const Customer = require('../models/Customer')
const Profile = require('../models/Profile')

async function getMatches(req, res) {
  const customer = await Customer.findById(req.params.id).lean()
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' })
  }

  const oppositeGender = customer.gender === 'Male' ? 'Female' : 'Male'
  const candidates = await Profile.find({ gender: oppositeGender }).lean()

  const ranked = candidates
    .map((candidate) => scoreMatch(customer, candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  res.json(ranked)
}

async function sendMatch(req, res) {
  const { customerId, matchId } = req.body || {}
  const customer = await Customer.findById(customerId).lean()
  const match = await Profile.findById(matchId).lean()

  if (!customer || !match) {
    return res.status(404).json({ message: 'Customer or match not found' })
  }

  res.json({
    status: 'sent',
    subject: `Intro for ${customer.firstName} and ${match.firstName}`,
    body: `Hello ${customer.firstName}, meet ${match.firstName} (${match.city}). ` +
      `Shared interests include ${match.languagesKnown.join(', ')}.`,
  })
}

function scoreMatch(customer, candidate) {
  const ageCustomer = computeAge(customer.dateOfBirth)
  const ageCandidate = computeAge(candidate.dateOfBirth)
  let score = 0
  const reasons = []

  if (customer.gender === 'Male') {
    if (ageCandidate < ageCustomer) {
      score += 20
      reasons.push('Younger age match')
    }
    if (candidate.income < customer.income) {
      score += 15
      reasons.push('Income alignment')
    }
    if (candidate.heightCm < customer.heightCm) {
      score += 12
      reasons.push('Height preference')
    }
    if (candidate.wantKids === customer.wantKids) {
      score += 18
      reasons.push('Shared kids preference')
    }
    if (candidate.openToPets === customer.openToPets) {
      score += 8
      reasons.push('Pets preference aligned')
    }
  } else {
    if (candidate.openToRelocate === customer.openToRelocate) {
      score += 18
      reasons.push('Relocation preference aligned')
    }
    if (candidate.wantKids === customer.wantKids) {
      score += 18
      reasons.push('Shared kids preference')
    }
    if (candidate.openToPets === customer.openToPets) {
      score += 10
      reasons.push('Pets preference aligned')
    }
    if (hasSharedLanguage(customer.languagesKnown, candidate.languagesKnown)) {
      score += 12
      reasons.push('Shared language(s)')
    }
    if (candidate.degree === customer.degree) {
      score += 10
      reasons.push('Similar education background')
    }
  }

  if (candidate.city === customer.city) {
    score += 8
    reasons.push('Same city')
  }
  if (candidate.religion === customer.religion) {
    score += 6
    reasons.push('Shared religion')
  }

  const explanation = buildAiExplanation(score, reasons, candidate)

  return {
    ...candidate,
    id: candidate._id,
    score,
    explanation,
  }
}

function buildAiExplanation(score, reasons, candidate) {
  const label =
    score >= 70 ? 'High Potential Match' : score >= 50 ? 'Good Fit' : 'Possible Match'
  const highlights = reasons.length ? reasons.join(', ') : 'Limited shared preferences'
  return `${label}: ${highlights}. ${candidate.firstName} lives in ${candidate.city}.`
}

function computeAge(dateOfBirth) {
  const dob = new Date(dateOfBirth)
  const diff = Date.now() - dob.getTime()
  const ageDate = new Date(diff)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

function hasSharedLanguage(a = [], b = []) {
  return a.some((lang) => b.includes(lang))
}

module.exports = { getMatches, sendMatch }
