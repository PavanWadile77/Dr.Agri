export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
].sort();

export const statesByCountry: Record<string, string[]> = {
  "India": [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ].sort(),
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ].sort(),
  "Brazil": ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"].sort(),
  "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"].sort()
};

export const districtsByState: Record<string, string[]> = {
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", 
    "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", 
    "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", 
    "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", 
    "Washim", "Yavatmal"
  ].sort(),
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran"].sort(),
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"].sort(),
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"].sort(),
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", 
    "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", 
    "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", 
    "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", 
    "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", 
    "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", 
    "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", 
    "Panchsheel Nagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", 
    "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", 
    "Sultanpur", "Unnao", "Varanasi"
  ].sort(),
  "California": [
    "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa", "Del Norte", 
    "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo", "Kern", "Kings", "Lake", 
    "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa", "Mendocino", "Merced", "Modoc", 
    "Mono", "Monterey", "Napa", "Nevada", "Orange", "Placer", "Plumas", "Riverside", "Sacramento", 
    "San Benito", "San Bernardino", "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", 
    "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou", 
    "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare", "Tuolumne", "Ventura", 
    "Yolo", "Yuba"
  ].sort()
};

export const talukasByDistrict: Record<string, string[]> = {
  "Nashik": ["Nashik", "Sinnar", "Igatpuri", "Trimbakeshwar", "Niphad", "Yeola", "Chandwad", "Nandgaon", "Kalwan", "Baglan", "Malegaon", "Surgana", "Peint", "Deola"].sort(),
  "Pune": ["Pune City", "Haveli", "Khed", "Ambegaon", "Junner", "Shirur", "Daund", "Indapur", "Baramati", "Purandhar", "Bhor", "Velhe", "Mulshi", "Maval"].sort(),
  "Ahmednagar": ["Akole", "Jamkhed", "Karjat", "Kopargaon", "Nagar", "Nevasa", "Parner", "Pathardi", "Rahata", "Rahuri", "Sangamner", "Shevgaon", "Shrigonda", "Shrirampur"].sort(),
  "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Narkhed", "Savner", "Kalameshwar", "Ramtek", "Parsconi", "Mauda", "Kuhi", "Bhiwapur", "Umred"].sort(),
  "Aurangabad": ["Aurangabad", "Paithan", "Phulambri", "Sillod", "Kannad", "Khuldabad", "Vaijapur", "Gangapur", "Soegaon"].sort(),
  "Jalgaon": ["Jalgaon", "Bhusawal", "Yawal", "Raver", "Muktainagar", "Amalner", "Chopda", "Erandol", "Parola", "Chalisgaon", "Jamner", "Pachora", "Bhadgaon", "Dharangaon", "Bodwad"].sort(),
  "Dhule": ["Dhule", "Sakri", "Sindkhede", "Shirpur"].sort(),
  "Nandurbar": ["Nandurbar", "Navapur", "Shahada", "Taloda", "Akkalkuwa", "Akran"].sort(),
  "Solapur": ["North Solapur", "South Solapur", "Akkalkot", "Barshi", "Mangalvedhe", "Pandharpur", "Sangola", "Madha", "Karmala", "Mohol", "Malshiras"].sort(),
  "Kolhapur": ["Karveer", "Panhala", "Shahuwadi", "Kagal", "Hatkanangale", "Shirol", "Radhanagari", "Gaganbawada", "Bhudargad", "Ajara", "Gadhinglaj", "Chandgad"].sort(),
  "Satara": ["Satara", "Karad", "Wai", "Mahabaleshwar", "Phaltan", "Man", "Khatav", "Koregaon", "Patan", "Jaoli", "Khandala"].sort(),
  "Sangli": ["Miraj", "Tasgaon", "Kavathe Mahankal", "Khanapur", "Atpadi", "Jat", "Kadegaon", "Shirala", "Walwa", "Palus"].sort(),
  "Ratnagiri": ["Ratnagiri", "Sangameshwar", "Lanja", "Rajapur", "Chiplun", "Guhagar", "Khed", "Dapoli", "Mandangad"].sort(),
  "Sindhudurg": ["Sawantwadi", "Kudal", "Vengurla", "Malvan", "Kankavli", "Devgad", "Vaibhavwadi", "Dodamarg"].sort(),
  "Amravati": ["Amravati", "Bhatkuli", "Nandgaon Khandeshwar", "Chandur Railway", "Dhamangaon Railway", "Tiosa", "Morshi", "Warud", "Achalpur", "Chandurbazar", "Anjangaon Surji", "Daryapur", "Chikhaldara", "Dharni"].sort(),
  "Akola": ["Akola", "Akot", "Telhara", "Balapur", "Patur", "Murtijapur", "Barshitakli"].sort(),
  "Buldhana": ["Buldhana", "Chikhli", "Deulgaon Raja", "Mehkar", "Sindkhed Raja", "Lonar", "Khamgaon", "Shegaon", "Nandura", "Malkapur", "Motaala", "Sangrampur", "Jalgaon Jamod"].sort(),
  "Washim": ["Washim", "Risod", "Malegaon", "Mangrulpir", "Karanja", "Manora"].sort(),
  "Yavatmal": ["Yavatmal", "Kalamb", "Babulgaon", "Darwha", "Digras", "Arni", "Ner", "Pusad", "Umarkhed", "Mahagaon", "Kelapur", "Ghatanji", "Pandharkawada", "Zari Jamani", "Ralegaon", "Maregaon", "Wani"].sort(),
  "Wardha": ["Wardha", "Seloo", "Arvi", "Ashti", "Karanja", "Hinganghat", "Samudrapur", "Deoli"].sort(),
  "Chandrapur": ["Chandrapur", "Saoli", "Mul", "Ballarpur", "Pombhurna", "Gondpipri", "Warora", "Bhadravati", "Chimur", "Nagbhir", "Brahmapuri", "Sindewahi", "Rajura", "Korpana", "Jiwati"].sort(),
  "Gadchiroli": ["Gadchiroli", "Dhanora", "Chamorshi", "Mulchera", "Desaiganj", "Armori", "Kurkheda", "Korchi", "Aheri", "Etapalli", "Bhamragad", "Sironcha"].sort(),
  "Bhandara": ["Bhandara", "Tumsar", "Pauni", "Mohadi", "Sakoli", "Lakhani", "Lakhandur"].sort(),
  "Gondia": ["Gondia", "Tirora", "Goregaon", "Arjuni Morgaon", "Amgaon", "Salekasa", "Sadak Arjuni", "Deori"].sort(),
  "Latur": ["Latur", "Udgir", "Ahmedpur", "Ausa", "Nilanga", "Chakur", "Renapur", "Deoni", "Shirur Anantpal", "Jalkot"].sort(),
  "Osmanabad": ["Osmanabad", "Tuljapur", "Umarga", "Lohara", "Kalamb", "Bhum", "Paranda", "Washi"].sort(),
  "Nanded": ["Nanded", "Ardhapur", "Mudkhed", "Bhokar", "Umri", "Loha", "Kandhar", "Kinwat", "Himayatnagar", "Hadgaon", "Mahur", "Deglur", "Mukhed", "Dharmabad", "Biloli", "Naigaon"].sort(),
  "Parbhani": ["Parbhani", "Jintur", "Sailu", "Manwath", "Pathri", "Sonpeth", "Gangakhed", "Palam", "Purna"].sort(),
  "Hingoli": ["Hingoli", "Kalamnuri", "Sengaon", "Aundha Nagnath", "Basmath"].sort(),
  "Beed": ["Beed", "Ashti", "Patoda", "Shirur", "Georai", "Majalgaon", "Wadwani", "Kaij", "Dharur", "Parli", "Ambajogai"].sort(),
  "Jalna": ["Jalna", "Badnapur", "Bhokardan", "Jafrabad", "Partur", "Mantha", "Ambad", "Ghansawangi"].sort(),
  "Thane": ["Thane", "Kalyan", "Murbad", "Bhiwandi", "Shahapur", "Ulhasnagar", "Ambarnath"].sort(),
  "Palghar": ["Palghar", "Vada", "Talasari", "Jawhar", "Mokhada", "Dahanu", "Vikramgad", "Vasai"].sort(),
  "Raigad": ["Alibag", "Pen", "Murud", "Panvel", "Uran", "Karjat", "Khalapur", "Mangaon", "Rohas", "Tala", "Shrivardhan", "Mhasala", "Mahad", "Poladpur", "Sudhagad"].sort(),
};
