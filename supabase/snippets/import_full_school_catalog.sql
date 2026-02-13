-- Generated from NCAA directory and Wikipedia NAIA/NJCAA lists

-- Sources:

-- NCAA: https://web3.ncaa.org/directory/api/directory/memberList?type=12

-- NAIA: https://en.wikipedia.org/wiki/List_of_NAIA_institutions

-- NJCAA D1/D2/D3: https://en.wikipedia.org/wiki/List_of_NJCAA_Division_I_schools

-- Safe to re-run

BEGIN;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Alabama A&M University',
            NULL,
            'AL',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Alabama State University',
            NULL,
            'AL',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Auburn University',
            NULL,
            'AL',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Jacksonville State University',
            NULL,
            'AL',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Samford University',
            NULL,
            'AL',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'Troy University',
            NULL,
            'AL',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of Alabama',
            NULL,
            'AL',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Alabama at Birmingham',
            NULL,
            'AL',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of North Alabama',
            NULL,
            'AL',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'University of South Alabama',
            NULL,
            'AL',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Arkansas State University',
            NULL,
            'AR',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of Arkansas at Little Rock',
            NULL,
            'AR',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Arkansas, Fayetteville',
            NULL,
            'AR',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Arkansas, Pine Bluff',
            NULL,
            'AR',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Central Arkansas',
            NULL,
            'AR',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Arizona State University',
            NULL,
            'AZ',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'Grand Canyon University',
            NULL,
            'AZ',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'Northern Arizona University',
            NULL,
            'AZ',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'University of Arizona',
            NULL,
            'AZ',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'California Baptist University',
            NULL,
            'CA',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'California Polytechnic State University',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'California State University, Bakersfield',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'California State University, Fresno',
            NULL,
            'CA',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'California State University, Fullerton',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'California State University, Northridge',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'California State University, Sacramento',
            NULL,
            'CA',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'Long Beach State University',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'Loyola Marymount University',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Pepperdine University',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Mary''s College of California',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'San Diego State University',
            NULL,
            'CA',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'San Jose State University',
            NULL,
            'CA',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'Santa Clara University',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Stanford University',
            NULL,
            'CA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, Berkeley',
            NULL,
            'CA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, Davis',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, Irvine',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, Los Angeles',
            NULL,
            'CA',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, Riverside',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, San Diego',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'University of California, Santa Barbara',
            NULL,
            'CA',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'University of San Diego',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of San Francisco',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of Southern California',
            NULL,
            'CA',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of the Pacific',
            NULL,
            'CA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Colorado State University',
            NULL,
            'CO',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'U.S. Air Force Academy',
            NULL,
            'CO',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'University of Colorado Boulder',
            NULL,
            'CO',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Denver',
            NULL,
            'CO',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'University of Northern Colorado',
            NULL,
            'CO',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'Central Connecticut State University',
            NULL,
            'CT',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Fairfield University',
            NULL,
            'CT',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Quinnipiac University',
            NULL,
            'CT',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Sacred Heart University',
            NULL,
            'CT',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Connecticut',
            NULL,
            'CT',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'Yale University',
            NULL,
            'CT',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'American University',
            NULL,
            'DC',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'George Washington University',
            NULL,
            'DC',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Georgetown University',
            NULL,
            'DC',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'Howard University',
            NULL,
            'DC',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Delaware State University',
            NULL,
            'DE',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Delaware',
            NULL,
            'DE',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Bethune-Cookman University',
            NULL,
            'FL',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Florida A&M University',
            NULL,
            'FL',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Florida Atlantic University',
            NULL,
            'FL',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'Florida Gulf Coast University',
            NULL,
            'FL',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Florida International University',
            NULL,
            'FL',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Florida State University',
            NULL,
            'FL',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Jacksonville University',
            NULL,
            'FL',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Stetson University',
            NULL,
            'FL',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'University of Central Florida',
            NULL,
            'FL',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Florida',
            NULL,
            'FL',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Miami',
            NULL,
            'FL',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of North Florida',
            NULL,
            'FL',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'University of South Florida',
            NULL,
            'FL',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'Georgia Institute of Technology',
            NULL,
            'GA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Georgia Southern University',
            NULL,
            'GA',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Georgia State University',
            NULL,
            'GA',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Kennesaw State University',
            NULL,
            'GA',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Mercer University',
            NULL,
            'GA',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Georgia',
            NULL,
            'GA',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Hawaii, Manoa',
            NULL,
            'HI',
            'd1',
            'Big West Conference',
            ARRAY[]::text[]
        ),
(
            'Drake University',
            NULL,
            'IA',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Iowa State University',
            NULL,
            'IA',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Iowa',
            NULL,
            'IA',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of Northern Iowa',
            NULL,
            'IA',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Boise State University',
            NULL,
            'ID',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'Idaho State University',
            NULL,
            'ID',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'University of Idaho',
            NULL,
            'ID',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'Bradley University',
            NULL,
            'IL',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Chicago State University',
            NULL,
            'IL',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'DePaul University',
            NULL,
            'IL',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Illinois University',
            NULL,
            'IL',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Illinois State University',
            NULL,
            'IL',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Loyola University Chicago',
            NULL,
            'IL',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Northern Illinois University',
            NULL,
            'IL',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Northwestern University',
            NULL,
            'IL',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Illinois University at Carbondale',
            NULL,
            'IL',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Illinois University Edwardsville',
            NULL,
            'IL',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Illinois Chicago',
            NULL,
            'IL',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Illinois Urbana-Champaign',
            NULL,
            'IL',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Western Illinois University',
            NULL,
            'IL',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Ball State University',
            NULL,
            'IN',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Butler University',
            NULL,
            'IN',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'EC University',
            NULL,
            'IN',
            'd1',
            NULL,
            ARRAY[]::text[]
        ),
(
            'Indiana State University',
            NULL,
            'IN',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University Indianapolis',
            NULL,
            'IN',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'Indiana University, Bloomington',
            NULL,
            'IN',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Purdue University',
            NULL,
            'IN',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Purdue University Fort Wayne',
            NULL,
            'IN',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'University of Evansville',
            NULL,
            'IN',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Notre Dame',
            NULL,
            'IN',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of Southern Indiana',
            NULL,
            'IN',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Valparaiso University',
            NULL,
            'IN',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Kansas State University',
            NULL,
            'KS',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Kansas',
            NULL,
            'KS',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'Wichita State University',
            NULL,
            'KS',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'Bellarmine University',
            NULL,
            'KY',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Kentucky University',
            NULL,
            'KY',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Morehead State University',
            NULL,
            'KY',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Murray State University',
            NULL,
            'KY',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Northern Kentucky University',
            NULL,
            'KY',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'University of Kentucky',
            NULL,
            'KY',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Louisville',
            NULL,
            'KY',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Western Kentucky University',
            NULL,
            'KY',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Grambling State University',
            NULL,
            'LA',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Louisiana State University',
            NULL,
            'LA',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Louisiana Tech University',
            NULL,
            'LA',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'McNeese State University',
            NULL,
            'LA',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Nicholls State University',
            NULL,
            'LA',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Northwestern State University',
            NULL,
            'LA',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Southeastern Louisiana University',
            NULL,
            'LA',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Southern University, Baton Rouge',
            NULL,
            'LA',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Tulane University',
            NULL,
            'LA',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Louisiana at Lafayette',
            NULL,
            'LA',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of Louisiana Monroe',
            NULL,
            'LA',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of New Orleans',
            NULL,
            'LA',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Boston College',
            NULL,
            'MA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Boston University',
            NULL,
            'MA',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'College of the Holy Cross',
            NULL,
            'MA',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'Harvard University',
            NULL,
            'MA',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'Merrimack College',
            NULL,
            'MA',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northeastern University',
            NULL,
            'MA',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Stonehill College',
            NULL,
            'MA',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'University of Massachusetts Lowell',
            NULL,
            'MA',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'University of Massachusetts, Amherst',
            NULL,
            'MA',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Coppin State University',
            NULL,
            'MD',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Loyola University Maryland',
            NULL,
            'MD',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'Morgan State University',
            NULL,
            'MD',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Mount St. Mary''s University',
            NULL,
            'MD',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Towson University',
            NULL,
            'MD',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'U.S. Naval Academy',
            NULL,
            'MD',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'University of Maryland Eastern Shore',
            NULL,
            'MD',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Maryland, Baltimore County',
            NULL,
            'MD',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'University of Maryland, College Park',
            NULL,
            'MD',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of Maine',
            NULL,
            'ME',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'Central Michigan University',
            NULL,
            'MI',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Michigan University',
            NULL,
            'MI',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Michigan State University',
            NULL,
            'MI',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Oakland University',
            NULL,
            'MI',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'University of Detroit Mercy',
            NULL,
            'MI',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'University of Michigan',
            NULL,
            'MI',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Western Michigan University',
            NULL,
            'MI',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Minnesota, Twin Cities',
            NULL,
            'MN',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of St. Thomas',
            NULL,
            'MN',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'Lindenwood University',
            NULL,
            'MO',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Missouri State University',
            NULL,
            'MO',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Saint Louis University',
            NULL,
            'MO',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Southeast Missouri State University',
            NULL,
            'MO',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Missouri-Kansas City',
            NULL,
            'MO',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'University of Missouri, Columbia',
            NULL,
            'MO',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Alcorn State University',
            NULL,
            'MS',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Jackson State University',
            NULL,
            'MS',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Mississippi State University',
            NULL,
            'MS',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Mississippi Valley State University',
            NULL,
            'MS',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'The University of Southern Mississippi',
            NULL,
            'MS',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of Mississippi',
            NULL,
            'MS',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Montana State University-Bozeman',
            NULL,
            'MT',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'University of Montana',
            NULL,
            'MT',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'Appalachian State University',
            NULL,
            'NC',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Campbell University',
            NULL,
            'NC',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Davidson College',
            NULL,
            'NC',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Duke University',
            NULL,
            'NC',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'East Carolina University',
            NULL,
            'NC',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'Elon University',
            NULL,
            'NC',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Gardner-Webb University',
            NULL,
            'NC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'High Point University',
            NULL,
            'NC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'North Carolina A&T State University',
            NULL,
            'NC',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'North Carolina Central University',
            NULL,
            'NC',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'North Carolina State University',
            NULL,
            'NC',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Queens University of Charlotte',
            NULL,
            'NC',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'The University of North Carolina at Charlotte',
            NULL,
            'NC',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'The University of North Carolina at Greensboro',
            NULL,
            'NC',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'University of North Carolina Asheville',
            NULL,
            'NC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'University of North Carolina Wilmington',
            NULL,
            'NC',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'University of North Carolina, Chapel Hill',
            NULL,
            'NC',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Wake Forest University',
            NULL,
            'NC',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Western Carolina University',
            NULL,
            'NC',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'North Dakota State University',
            NULL,
            'ND',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'University of North Dakota',
            NULL,
            'ND',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'Creighton University',
            NULL,
            'NE',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'University of Nebraska at Omaha',
            NULL,
            'NE',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'University of Nebraska-Lincoln',
            NULL,
            'NE',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Dartmouth College',
            NULL,
            'NH',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'University of New Hampshire',
            NULL,
            'NH',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'Fairleigh Dickinson University, Metropolitan Campus',
            NULL,
            'NJ',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Monmouth University',
            NULL,
            'NJ',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'New Jersey Institute of Technology',
            NULL,
            'NJ',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'Princeton University',
            NULL,
            'NJ',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'Rider University',
            NULL,
            'NJ',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rutgers, The State University of New Jersey, New Brunswick',
            NULL,
            'NJ',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Peter''s University',
            NULL,
            'NJ',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Seton Hall University',
            NULL,
            'NJ',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'New Mexico State University',
            NULL,
            'NM',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'University of New Mexico',
            NULL,
            'NM',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'University of Nevada, Las Vegas',
            NULL,
            'NV',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'University of Nevada, Reno',
            NULL,
            'NV',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'Binghamton University',
            NULL,
            'NY',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'Canisius University',
            NULL,
            'NY',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Colgate University',
            NULL,
            'NY',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'Columbia University-Barnard College',
            NULL,
            'NY',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'Cornell University',
            NULL,
            'NY',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'Fordham University',
            NULL,
            'NY',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Hofstra University',
            NULL,
            'NY',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Iona University',
            NULL,
            'NY',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Long Island University',
            NULL,
            'NY',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Manhattan University',
            NULL,
            'NY',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Marist University',
            NULL,
            'NY',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Niagara University',
            NULL,
            'NY',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Siena University',
            NULL,
            'NY',
            'd1',
            'Metro Atlantic Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'St. Bonaventure University',
            NULL,
            'NY',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'St. John''s University',
            NULL,
            'NY',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'Stony Brook University',
            NULL,
            'NY',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Syracuse University',
            NULL,
            'NY',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'U.S. Military Academy',
            NULL,
            'NY',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'University at Albany',
            NULL,
            'NY',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'University at Buffalo, the State University of New York',
            NULL,
            'NY',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Wagner College',
            NULL,
            'NY',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Bowling Green State University',
            NULL,
            'OH',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Cleveland State University',
            NULL,
            'OH',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'Kent State University',
            NULL,
            'OH',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Miami University',
            NULL,
            'OH',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Ohio University',
            NULL,
            'OH',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'The Ohio State University',
            NULL,
            'OH',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of Akron',
            NULL,
            'OH',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Cincinnati',
            NULL,
            'OH',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Dayton',
            NULL,
            'OH',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Toledo',
            NULL,
            'OH',
            'd1',
            'Mid-American Conference',
            ARRAY[]::text[]
        ),
(
            'Wright State University',
            NULL,
            'OH',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'Xavier University',
            NULL,
            'OH',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Youngstown State University',
            NULL,
            'OH',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'Oklahoma State University',
            NULL,
            'OK',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'Oral Roberts University',
            NULL,
            'OK',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'The University of Tulsa',
            NULL,
            'OK',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Oklahoma',
            NULL,
            'OK',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Oregon State University',
            NULL,
            'OR',
            'd1',
            'Pac-12 Conference',
            ARRAY[]::text[]
        ),
(
            'Portland State University',
            NULL,
            'OR',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'University of Oregon',
            NULL,
            'OR',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of Portland',
            NULL,
            'OR',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Bucknell University',
            NULL,
            'PA',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'Drexel University',
            NULL,
            'PA',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Duquesne University',
            NULL,
            'PA',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'La Salle University',
            NULL,
            'PA',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Lafayette College',
            NULL,
            'PA',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'Lehigh University',
            NULL,
            'PA',
            'd1',
            'Patriot League',
            ARRAY[]::text[]
        ),
(
            'Pennsylvania State University',
            NULL,
            'PA',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Robert Morris University',
            NULL,
            'PA',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'Saint Francis University',
            NULL,
            'PA',
            'd1',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Joseph''s University',
            NULL,
            'PA',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Temple University',
            NULL,
            'PA',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Pennsylvania',
            NULL,
            'PA',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'University of Pittsburgh',
            NULL,
            'PA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Villanova University',
            NULL,
            'PA',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'Brown University',
            NULL,
            'RI',
            'd1',
            'The Ivy League',
            ARRAY[]::text[]
        ),
(
            'Bryant University',
            NULL,
            'RI',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'Providence College',
            NULL,
            'RI',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'University of Rhode Island',
            NULL,
            'RI',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Charleston Southern University',
            NULL,
            'SC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'Clemson University',
            NULL,
            'SC',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Coastal Carolina University',
            NULL,
            'SC',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'College of Charleston',
            NULL,
            'SC',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Furman University',
            NULL,
            'SC',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'Presbyterian College',
            NULL,
            'SC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'South Carolina State University',
            NULL,
            'SC',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'The Citadel',
            NULL,
            'SC',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina Upstate',
            NULL,
            'SC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina, Columbia',
            NULL,
            'SC',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Winthrop University',
            NULL,
            'SC',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'Wofford College',
            NULL,
            'SC',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'South Dakota State University',
            NULL,
            'SD',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'University of South Dakota',
            NULL,
            'SD',
            'd1',
            'The Summit League',
            ARRAY[]::text[]
        ),
(
            'Austin Peay State University',
            NULL,
            'TN',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Belmont University',
            NULL,
            'TN',
            'd1',
            'Missouri Valley Conference',
            ARRAY[]::text[]
        ),
(
            'East Tennessee State University',
            NULL,
            'TN',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'Lipscomb University',
            NULL,
            'TN',
            'd1',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Middle Tennessee State University',
            NULL,
            'TN',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Tennessee State University',
            NULL,
            'TN',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Tennessee Technological University',
            NULL,
            'TN',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Memphis',
            NULL,
            'TN',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Tennessee at Chattanooga',
            NULL,
            'TN',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Tennessee at Martin',
            NULL,
            'TN',
            'd1',
            'Ohio Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Tennessee, Knoxville',
            NULL,
            'TN',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Vanderbilt University',
            NULL,
            'TN',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Abilene Christian University',
            NULL,
            'TX',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Baylor University',
            NULL,
            'TX',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'East Texas A&M University',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Houston Christian University',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Lamar University',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Prairie View A&M University',
            NULL,
            'TX',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Rice University',
            NULL,
            'TX',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'Sam Houston State University',
            NULL,
            'TX',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Southern Methodist University',
            NULL,
            'TX',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Stephen F. Austin State University',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Tarleton State University',
            NULL,
            'TX',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Texas A&M University-Corpus Christi',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Texas A&M University, College Station',
            NULL,
            'TX',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'Texas Christian University',
            NULL,
            'TX',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'Texas Southern University',
            NULL,
            'TX',
            'd1',
            'Southwestern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Texas State University',
            NULL,
            'TX',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Texas Tech University',
            NULL,
            'TX',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'The University of Texas Rio Grande Valley',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'University of Houston',
            NULL,
            'TX',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of North Texas',
            NULL,
            'TX',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Texas at Arlington',
            NULL,
            'TX',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Texas at Austin',
            NULL,
            'TX',
            'd1',
            'Southeastern Conference',
            ARRAY[]::text[]
        ),
(
            'University of Texas at El Paso',
            NULL,
            'TX',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'University of Texas at San Antonio',
            NULL,
            'TX',
            'd1',
            'American Conference',
            ARRAY[]::text[]
        ),
(
            'University of the Incarnate Word',
            NULL,
            'TX',
            'd1',
            'Southland Conference',
            ARRAY[]::text[]
        ),
(
            'Brigham Young University',
            NULL,
            'UT',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Utah University',
            NULL,
            'UT',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Utah',
            NULL,
            'UT',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'Utah State University',
            NULL,
            'UT',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'Utah Tech University',
            NULL,
            'UT',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Utah Valley University',
            NULL,
            'UT',
            'd1',
            'Western Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Weber State University',
            NULL,
            'UT',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'George Mason University',
            NULL,
            'VA',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Hampton University',
            NULL,
            'VA',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'James Madison University',
            NULL,
            'VA',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Liberty University',
            NULL,
            'VA',
            'd1',
            'Conference USA',
            ARRAY[]::text[]
        ),
(
            'Longwood University',
            NULL,
            'VA',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'Norfolk State University',
            NULL,
            'VA',
            'd1',
            'Mid-Eastern Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Old Dominion University',
            NULL,
            'VA',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Radford University',
            NULL,
            'VA',
            'd1',
            'Big South Conference',
            ARRAY[]::text[]
        ),
(
            'University of Richmond',
            NULL,
            'VA',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Virginia',
            NULL,
            'VA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Virginia Commonwealth University',
            NULL,
            'VA',
            'd1',
            'Atlantic 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Virginia Military Institute',
            NULL,
            'VA',
            'd1',
            'Southern Conference',
            ARRAY[]::text[]
        ),
(
            'Virginia Polytechnic Institute and State University',
            NULL,
            'VA',
            'd1',
            'Atlantic Coast Conference',
            ARRAY[]::text[]
        ),
(
            'William & Mary',
            NULL,
            'VA',
            'd1',
            'Coastal Athletic Association',
            ARRAY[]::text[]
        ),
(
            'University of Vermont',
            NULL,
            'VT',
            'd1',
            'America East Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Washington University',
            NULL,
            'WA',
            'd1',
            'Big Sky Conference',
            ARRAY[]::text[]
        ),
(
            'Gonzaga University',
            NULL,
            'WA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Seattle University',
            NULL,
            'WA',
            'd1',
            'West Coast Conference',
            ARRAY[]::text[]
        ),
(
            'University of Washington',
            NULL,
            'WA',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'Washington State University',
            NULL,
            'WA',
            'd1',
            'Pac-12 Conference',
            ARRAY[]::text[]
        ),
(
            'Marquette University',
            NULL,
            'WI',
            'd1',
            'BIG EAST Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Green Bay',
            NULL,
            'WI',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Madison',
            NULL,
            'WI',
            'd1',
            'Big Ten Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Milwaukee',
            NULL,
            'WI',
            'd1',
            'Horizon League',
            ARRAY[]::text[]
        ),
(
            'Marshall University',
            NULL,
            'WV',
            'd1',
            'Sun Belt Conference',
            ARRAY[]::text[]
        ),
(
            'West Virginia University',
            NULL,
            'WV',
            'd1',
            'Big 12 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wyoming',
            NULL,
            'WY',
            'd1',
            'Mountain West Conference',
            ARRAY[]::text[]
        ),
(
            'University of Alaska Anchorage',
            NULL,
            'AK',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Alaska Fairbanks',
            NULL,
            'AK',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Auburn University at Montgomery',
            NULL,
            'AL',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Miles College',
            NULL,
            'AL',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Spring Hill College',
            NULL,
            'AL',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Tuskegee University',
            NULL,
            'AL',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Alabama in Huntsville',
            NULL,
            'AL',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'University of Montevallo',
            NULL,
            'AL',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'University of West Alabama',
            NULL,
            'AL',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Arkansas Tech University',
            NULL,
            'AR',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Harding University',
            NULL,
            'AR',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Henderson State University',
            NULL,
            'AR',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Ouachita Baptist University',
            NULL,
            'AR',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Arkansas University',
            NULL,
            'AR',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Arkansas, Fort Smith',
            NULL,
            'AR',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'University of Arkansas, Monticello',
            NULL,
            'AR',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Simon Fraser University',
            NULL,
            'BC',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Azusa Pacific University',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Biola University',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'California State Polytechnic University, Humboldt',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State Polytechnic University, Pomona',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, Chico',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, Dominguez Hills',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, East Bay',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, Los Angeles',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, Monterey Bay',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, San Bernardino',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, San Marcos',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'California State University, Stanislaus',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Concordia University Irvine',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Dominican University of California',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Fresno Pacific University',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Jessup University',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Menlo College',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Point Loma Nazarene University',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'San Francisco State University',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Sonoma State University',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'University of California, Merced',
            NULL,
            'CA',
            'd2',
            'California Collegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Vanguard University',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Westmont College',
            NULL,
            'CA',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Adams State University',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Colorado Christian University',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Colorado Mesa University',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Colorado School of Mines',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Colorado State University Pueblo',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Fort Lewis College',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Metropolitan State University of Denver',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Regis University',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Colorado Colorado Springs',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Western Colorado University',
            NULL,
            'CO',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Post University',
            NULL,
            'CT',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Connecticut State University',
            NULL,
            'CT',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'University of Bridgeport',
            NULL,
            'CT',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of New Haven',
            NULL,
            'CT',
            'd2',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'University of the District of Columbia',
            NULL,
            'DC',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Goldey-Beacom College',
            NULL,
            'DE',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Wilmington University',
            NULL,
            'DE',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Barry University',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Eckerd College',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Edward Waters University',
            NULL,
            'FL',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Embry-Riddle Aeronautical University',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Flagler College',
            NULL,
            'FL',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Florida Institute of Technology',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Florida Southern College',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Lynn University',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Nova Southeastern University',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Palm Beach Atlantic University',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Rollins College',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Leo University',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'University of Tampa',
            NULL,
            'FL',
            'd2',
            'Sunshine State Conference',
            ARRAY[]::text[]
        ),
(
            'University of West Florida',
            NULL,
            'FL',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Albany State University',
            NULL,
            'GA',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Augusta University',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Clark Atlanta University',
            NULL,
            'GA',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Clayton State University',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Columbus State University',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Emmanuel University',
            NULL,
            'GA',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Fort Valley State University',
            NULL,
            'GA',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Georgia College',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Georgia Southwestern State University',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Middle Georgia State University',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Morehouse College',
            NULL,
            'GA',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Savannah State University',
            NULL,
            'GA',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Shorter University',
            NULL,
            'GA',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'University of North Georgia',
            NULL,
            'GA',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of West Georgia',
            NULL,
            'GA',
            'd2',
            'Atlantic Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Valdosta State University',
            NULL,
            'GA',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Young Harris College',
            NULL,
            'GA',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Chaminade University',
            NULL,
            'HI',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Hawaii Pacific University',
            NULL,
            'HI',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'University of Hawaii at Hilo',
            NULL,
            'HI',
            'd2',
            'Pacific West Conference',
            ARRAY[]::text[]
        ),
(
            'Upper Iowa University',
            NULL,
            'IA',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Northwest Nazarene University',
            NULL,
            'ID',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Lewis University',
            NULL,
            'IL',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'McKendree University',
            NULL,
            'IL',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Quincy University',
            NULL,
            'IL',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Roosevelt University',
            NULL,
            'IL',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Illinois Springfield',
            NULL,
            'IL',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Purdue University Northwest',
            NULL,
            'IN',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Indianapolis',
            NULL,
            'IN',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Emporia State University',
            NULL,
            'KS',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Fort Hays State University',
            NULL,
            'KS',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Newman University',
            NULL,
            'KS',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Pittsburg State University',
            NULL,
            'KS',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Washburn University',
            NULL,
            'KS',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Kentucky State University',
            NULL,
            'KY',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Kentucky Wesleyan College',
            NULL,
            'KY',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Thomas More University',
            NULL,
            'KY',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'American International College',
            NULL,
            'MA',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Assumption University',
            NULL,
            'MA',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Bentley University',
            NULL,
            'MA',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Bowie State University',
            NULL,
            'MD',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Frostburg State University',
            NULL,
            'MD',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Davenport University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ferris State University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Grand Valley State University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hillsdale College',
            NULL,
            'MI',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Lake Superior State University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Michigan Technological University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northern Michigan University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northwood University',
            NULL,
            'MI',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saginaw Valley State University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wayne State University',
            NULL,
            'MI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bemidji State University',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Concordia University, St. Paul',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Minnesota State University Moorhead',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Minnesota State University, Mankato',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Southwest Minnesota State University',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'St. Cloud State University',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Minnesota Duluth',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Minnesota, Crookston',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Winona State University',
            NULL,
            'MN',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Drury University',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Lincoln University',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Maryville University of Saint Louis',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Missouri Southern State University',
            NULL,
            'MO',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Missouri University of Science and Technology',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Missouri Western State University',
            NULL,
            'MO',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Northwest Missouri State University',
            NULL,
            'MO',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Rockhurst University',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Southwest Baptist University',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Truman State University',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'University of Central Missouri',
            NULL,
            'MO',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'University of Missouri-St. Louis',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'William Jewell College',
            NULL,
            'MO',
            'd2',
            'Great Lakes Valley Conference',
            ARRAY[]::text[]
        ),
(
            'Delta State University',
            NULL,
            'MS',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Mississippi College',
            NULL,
            'MS',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Montana State University Billings',
            NULL,
            'MT',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Barton College',
            NULL,
            'NC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Belmont Abbey College',
            NULL,
            'NC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Catawba College',
            NULL,
            'NC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Chowan University',
            NULL,
            'NC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Elizabeth City State University',
            NULL,
            'NC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Fayetteville State University',
            NULL,
            'NC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Johnson C. Smith University',
            NULL,
            'NC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Lees-McRae College',
            NULL,
            'NC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Lenoir-Rhyne University',
            NULL,
            'NC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Livingstone College',
            NULL,
            'NC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Mars Hill University',
            NULL,
            'NC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Shaw University',
            NULL,
            'NC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'University of Mount Olive',
            NULL,
            'NC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'University of North Carolina at Pembroke',
            NULL,
            'NC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Wingate University',
            NULL,
            'NC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Winston-Salem State University',
            NULL,
            'NC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Minot State University',
            NULL,
            'ND',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Jamestown',
            NULL,
            'ND',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Mary',
            NULL,
            'ND',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Chadron State College',
            NULL,
            'NE',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Nebraska at Kearney',
            NULL,
            'NE',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Wayne State College',
            NULL,
            'NE',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Franklin Pierce University',
            NULL,
            'NH',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Anselm College',
            NULL,
            'NH',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Southern New Hampshire University',
            NULL,
            'NH',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Caldwell University',
            NULL,
            'NJ',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Felician University',
            NULL,
            'NJ',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Georgian Court University',
            NULL,
            'NJ',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern New Mexico University',
            NULL,
            'NM',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'New Mexico Highlands University',
            NULL,
            'NM',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Western New Mexico University',
            NULL,
            'NM',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Adelphi University',
            NULL,
            'NY',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'College of Staten Island',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'D''Youville University',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Daemen University',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Dominican University New York',
            NULL,
            'NY',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Le Moyne College',
            NULL,
            'NY',
            'd2',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Mercy University',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Molloy University',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Pace University',
            NULL,
            'NY',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Queens College',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Roberts Wesleyan University',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'St. Thomas Aquinas College',
            NULL,
            'NY',
            'd2',
            'East Coast Conference',
            ARRAY[]::text[]
        ),
(
            'Ashland University',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Cedarville University',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Central State University',
            NULL,
            'OH',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Lake Erie College',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Malone University',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ohio Dominican University',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Tiffin University',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Findlay',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ursuline College',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Walsh University',
            NULL,
            'OH',
            'd2',
            'Great Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Cameron University',
            NULL,
            'OK',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'East Central University',
            NULL,
            'OK',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Northeastern State University',
            NULL,
            'OK',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Northwestern Oklahoma State University',
            NULL,
            'OK',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Oklahoma Baptist University',
            NULL,
            'OK',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Oklahoma Christian University',
            NULL,
            'OK',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Rogers State University',
            NULL,
            'OK',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Southeastern Oklahoma State University',
            NULL,
            'OK',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Nazarene University',
            NULL,
            'OK',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'Southwestern Oklahoma State University',
            NULL,
            'OK',
            'd2',
            'Great American Conference',
            ARRAY[]::text[]
        ),
(
            'University of Central Oklahoma',
            NULL,
            'OK',
            'd2',
            'Mid-America Intercollegiate Athletics Association',
            ARRAY[]::text[]
        ),
(
            'Western Oregon University',
            NULL,
            'OR',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bloomsburg University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Chestnut Hill College',
            NULL,
            'PA',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'East Stroudsburg University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Gannon University',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Holy Family University',
            NULL,
            'PA',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Kutztown University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Lincoln University',
            NULL,
            'PA',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Lock Haven University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mansfield University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mercyhurst University',
            NULL,
            'PA',
            'd2',
            'Northeast Conference',
            ARRAY[]::text[]
        ),
(
            'Millersville University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Pennsylvania Western University, California',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Pennsylvania Western University, Clarion',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Pennsylvania Western University, Edinboro',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Point Park University',
            NULL,
            'PA',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Seton Hill University',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Shippensburg University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Slippery Rock University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Thomas Jefferson University',
            NULL,
            'PA',
            'd2',
            'Central Atlantic Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Pittsburgh, Johnstown',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'West Chester University of Pennsylvania',
            NULL,
            'PA',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Puerto Rico, Bayamon',
            NULL,
            'PR',
            'd2',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'University of Puerto Rico, Mayaguez',
            NULL,
            'PR',
            'd2',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'University of Puerto Rico, Rio Piedras',
            NULL,
            'PR',
            'd2',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'Allen University',
            NULL,
            'SC',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Anderson University',
            NULL,
            'SC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Benedict College',
            NULL,
            'SC',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Claflin University',
            NULL,
            'SC',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Coker University',
            NULL,
            'SC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Converse University',
            NULL,
            'SC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Erskine College',
            NULL,
            'SC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Francis Marion University',
            NULL,
            'SC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Lander University',
            NULL,
            'SC',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Newberry College',
            NULL,
            'SC',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'North Greenville University',
            NULL,
            'SC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Southern Wesleyan University',
            NULL,
            'SC',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina Aiken',
            NULL,
            'SC',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina Beaufort',
            NULL,
            'SC',
            'd2',
            'Peach Belt Conference',
            ARRAY[]::text[]
        ),
(
            'Augustana University',
            NULL,
            'SD',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Black Hills State University',
            NULL,
            'SD',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northern State University',
            NULL,
            'SD',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'South Dakota School of Mines & Technology',
            NULL,
            'SD',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Sioux Falls',
            NULL,
            'SD',
            'd2',
            'Northern Sun Intercollegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Carson-Newman University',
            NULL,
            'TN',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Christian Brothers University',
            NULL,
            'TN',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'King University',
            NULL,
            'TN',
            'd2',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Lane College',
            NULL,
            'TN',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Lee University',
            NULL,
            'TN',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'LeMoyne-Owen College',
            NULL,
            'TN',
            'd2',
            'Southern Intercol. Ath. Conf.',
            ARRAY[]::text[]
        ),
(
            'Lincoln Memorial University',
            NULL,
            'TN',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Trevecca Nazarene University',
            NULL,
            'TN',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Tusculum University',
            NULL,
            'TN',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Union University',
            NULL,
            'TN',
            'd2',
            'Gulf South Conference',
            ARRAY[]::text[]
        ),
(
            'Angelo State University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Dallas Baptist University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Lubbock Christian University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Midwestern State University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'St. Edward''s University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'St. Mary''s University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Texas A&M International University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Texas A&M University-Kingsville',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Texas Woman''s University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'The University of Texas at Tyler',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'The University of Texas Permian Basin',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'West Texas A&M University',
            NULL,
            'TX',
            'd2',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Westminster University',
            NULL,
            'UT',
            'd2',
            'Rocky Mountain Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Emory & Henry University',
            NULL,
            'VA',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'The University of Virginia''s College at Wise',
            NULL,
            'VA',
            'd2',
            'South Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Virginia State University',
            NULL,
            'VA',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Virginia Union University',
            NULL,
            'VA',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Saint Michael''s College',
            NULL,
            'VT',
            'd2',
            'Northeast 10 Conference',
            ARRAY[]::text[]
        ),
(
            'Central Washington University',
            NULL,
            'WA',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Martin''s University',
            NULL,
            'WA',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Seattle Pacific University',
            NULL,
            'WA',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Western Washington University',
            NULL,
            'WA',
            'd2',
            'Great Northwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Parkside',
            NULL,
            'WI',
            'd2',
            'Great Lakes Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bluefield State University',
            NULL,
            'WV',
            'd2',
            'Central Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Concord University',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Davis & Elkins College',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Fairmont State University',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Glenville State University',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Salem University',
            NULL,
            'WV',
            'd2',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'Shepherd University',
            NULL,
            'WV',
            'd2',
            'Pennsylvania State Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Charleston',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'West Liberty University',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'West Virginia State University',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'West Virginia Wesleyan College',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Wheeling University',
            NULL,
            'WV',
            'd2',
            'Mountain East Conference',
            ARRAY[]::text[]
        ),
(
            'Huntingdon College',
            NULL,
            'AL',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Hendrix College',
            NULL,
            'AR',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Lyon College',
            NULL,
            'AR',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of the Ozarks',
            NULL,
            'AR',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'California Institute of Technology',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'California Lutheran University',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Chapman University',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Claremont McKenna-Harvey Mudd-Scripps Colleges',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Occidental College',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Pomona-Pitzer Colleges',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of California, Santa Cruz',
            NULL,
            'CA',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of La Verne',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Redlands',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Whittier College',
            NULL,
            'CA',
            'd3',
            'Southern California Intercollegiate Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Colorado College',
            NULL,
            'CO',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Albertus Magnus College',
            NULL,
            'CT',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Connecticut College',
            NULL,
            'CT',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Connecticut State University',
            NULL,
            'CT',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Mitchell College',
            NULL,
            'CT',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Trinity College',
            NULL,
            'CT',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'U.S. Coast Guard Academy',
            NULL,
            'CT',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Hartford',
            NULL,
            'CT',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'University of Saint Joseph',
            NULL,
            'CT',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wesleyan University',
            NULL,
            'CT',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Western Connecticut State University',
            NULL,
            'CT',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Catholic University',
            NULL,
            'DC',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Gallaudet University',
            NULL,
            'DC',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Trinity Washington University',
            NULL,
            'DC',
            'd3',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'Agnes Scott College',
            NULL,
            'GA',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Berry College',
            NULL,
            'GA',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Covenant College',
            NULL,
            'GA',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Emory University',
            NULL,
            'GA',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'LaGrange College',
            NULL,
            'GA',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Oglethorpe University',
            NULL,
            'GA',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Piedmont University',
            NULL,
            'GA',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Wesleyan College',
            NULL,
            'GA',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Buena Vista University',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Central College',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Coe College',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Cornell College',
            NULL,
            'IA',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Grinnell College',
            NULL,
            'IA',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Loras College',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Luther College',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Simpson College',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'University of Dubuque',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Wartburg College',
            NULL,
            'IA',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Augustana College',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Aurora University',
            NULL,
            'IL',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Benedictine University',
            NULL,
            'IL',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Blackburn College',
            NULL,
            'IL',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Concordia University Chicago',
            NULL,
            'IL',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Dominican University',
            NULL,
            'IL',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Elmhurst University',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Eureka College',
            NULL,
            'IL',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Greenville University',
            NULL,
            'IL',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Illinois College',
            NULL,
            'IL',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Illinois Institute of Technology',
            NULL,
            'IL',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Illinois Wesleyan University',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Knox College',
            NULL,
            'IL',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Lake Forest College',
            NULL,
            'IL',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Millikin University',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Monmouth College',
            NULL,
            'IL',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'North Central College',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'North Park University',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Principia College',
            NULL,
            'IL',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rockford University',
            NULL,
            'IL',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Chicago',
            NULL,
            'IL',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Wheaton College',
            NULL,
            'IL',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Anderson University',
            NULL,
            'IN',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'DePauw University',
            NULL,
            'IN',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Earlham College',
            NULL,
            'IN',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Franklin College',
            NULL,
            'IN',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hanover College',
            NULL,
            'IN',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Manchester University',
            NULL,
            'IN',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rose-Hulman Institute of Technology',
            NULL,
            'IN',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Mary''s College',
            NULL,
            'IN',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Trine University',
            NULL,
            'IN',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Wabash College',
            NULL,
            'IN',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Asbury University',
            NULL,
            'KY',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Berea College',
            NULL,
            'KY',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Centre College',
            NULL,
            'KY',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Spalding University',
            NULL,
            'KY',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Transylvania University',
            NULL,
            'KY',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Centenary College',
            NULL,
            'LA',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Amherst College',
            NULL,
            'MA',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Anna Maria College',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Babson College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Brandeis University',
            NULL,
            'MA',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Bridgewater State University',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Clark University',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Curry College',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Dean College',
            NULL,
            'MA',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Elms College',
            NULL,
            'MA',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Emerson College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Emmanuel College',
            NULL,
            'MA',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Endicott College',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Fitchburg State University',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Framingham State University',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Gordon College',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Lasell University',
            NULL,
            'MA',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Lesley University',
            NULL,
            'MA',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Massachusetts College of Liberal Arts',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Massachusetts Institute of Technology',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Massachusetts Maritime Academy',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Holyoke College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Nichols College',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Regis College',
            NULL,
            'MA',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Salem State University',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Simmons University',
            NULL,
            'MA',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Smith College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Springfield College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Suffolk University',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Tufts University',
            NULL,
            'MA',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Massachusetts Boston',
            NULL,
            'MA',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'University of Massachusetts, Dartmouth',
            NULL,
            'MA',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Wellesley College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wentworth Institute of Technology',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Western New England University',
            NULL,
            'MA',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Westfield State University',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wheaton College',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Williams College',
            NULL,
            'MA',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Worcester Polytechnic Institute',
            NULL,
            'MA',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Worcester State University',
            NULL,
            'MA',
            'd3',
            'Massachusetts State Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Goucher College',
            NULL,
            'MD',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Hood College',
            NULL,
            'MD',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Johns Hopkins University',
            NULL,
            'MD',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'McDaniel College',
            NULL,
            'MD',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Notre Dame of Maryland University',
            NULL,
            'MD',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Salisbury University',
            NULL,
            'MD',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'St. Mary''s College of Maryland',
            NULL,
            'MD',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Stevenson University',
            NULL,
            'MD',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Washington College',
            NULL,
            'MD',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Bates College',
            NULL,
            'ME',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bowdoin College',
            NULL,
            'ME',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Colby College',
            NULL,
            'ME',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Husson University',
            NULL,
            'ME',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Maine Maritime Academy',
            NULL,
            'ME',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Joseph''s College',
            NULL,
            'ME',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Thomas College',
            NULL,
            'ME',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Maine at Presque Isle',
            NULL,
            'ME',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Maine, Farmington',
            NULL,
            'ME',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'University of New England',
            NULL,
            'ME',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'University of Southern Maine',
            NULL,
            'ME',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Adrian College',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Albion College',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Alma College',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Calvin University',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Hope College',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Kalamazoo College',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'The University of Olivet',
            NULL,
            'MI',
            'd3',
            'Michigan Intercollegiate Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Augsburg University',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bethany Lutheran College',
            NULL,
            'MN',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bethel University',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Carleton College',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'College of Saint Benedict',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Concordia College, Moorhead',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Crown College',
            NULL,
            'MN',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Gustavus Adolphus College',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hamline University',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Macalester College',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Martin Luther College',
            NULL,
            'MN',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'North Central University',
            NULL,
            'MN',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint John''s University',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Mary''s University of Minnesota',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'St. Catherine University',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'St. Olaf College',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'The College of St. Scholastica',
            NULL,
            'MN',
            'd3',
            'Minnesota Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Minnesota, Morris',
            NULL,
            'MN',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Northwestern-St. Paul',
            NULL,
            'MN',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Washington University in St. Louis',
            NULL,
            'MO',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Webster University',
            NULL,
            'MO',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Westminster College',
            NULL,
            'MO',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Belhaven University',
            NULL,
            'MS',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Millsaps College',
            NULL,
            'MS',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Mississippi University for Women',
            NULL,
            'MS',
            'd3',
            'St. Louis Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Brevard College',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Greensboro College',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Guilford College',
            NULL,
            'NC',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Johnson & Wales University Charlotte',
            NULL,
            'NC',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Meredith College',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Methodist University',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'North Carolina Wesleyan University',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Pfeiffer University',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Salem College',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Warren Wilson College',
            NULL,
            'NC',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'William Peace University',
            NULL,
            'NC',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Nebraska Wesleyan University',
            NULL,
            'NE',
            'd3',
            'American Rivers Conference',
            ARRAY[]::text[]
        ),
(
            'Colby-Sawyer College',
            NULL,
            'NH',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Keene State College',
            NULL,
            'NH',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'New England College',
            NULL,
            'NH',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Plymouth State University',
            NULL,
            'NH',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Rivier University',
            NULL,
            'NH',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Centenary University',
            NULL,
            'NJ',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Drew University',
            NULL,
            'NJ',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Fairleigh Dickinson University, Florham',
            NULL,
            'NJ',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Kean University',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Montclair State University',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'New Jersey City University',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ramapo College',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rowan University',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rutgers, The State Univ. of New Jersey, Camden',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rutgers, The State Univ. of New Jersey, Newark',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Elizabeth University',
            NULL,
            'NJ',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Stevens Institute of Technology',
            NULL,
            'NJ',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Stockton University',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'The College of New Jersey',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'William Paterson University of New Jersey',
            NULL,
            'NJ',
            'd3',
            'New Jersey Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Alfred State College',
            NULL,
            'NY',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Alfred University',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Bard College',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'Baruch College',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Brooklyn College',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Buffalo State, State University of New York',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Clarkson University',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'Elmira College',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Farmingdale State College',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'Hamilton College',
            NULL,
            'NY',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hartwick College',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Hilbert College',
            NULL,
            'NY',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Hobart and William Smith Colleges',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'Houghton University',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Hunter College',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ithaca College',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'John Jay College of Criminal Justice',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Keuka College',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Lehman College',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Manhattanville University',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'Medgar Evers College',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Saint Mary College',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'Nazareth University',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'New York University',
            NULL,
            'NY',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Plattsburgh State University of New York',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Pratt Institute',
            NULL,
            'NY',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Purchase College, State University of New York',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'Rensselaer Polytechnic Institute',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'Rochester Institute of Technology',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'Russell Sage College',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Sarah Lawrence College',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'Skidmore College',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'St. John Fisher University',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'St. Joseph''s University NY',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'St. Joseph''s University, New York L.I.',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'St. Lawrence University',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Brockport',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Canton',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Cobleskill',
            NULL,
            'NY',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Cortland',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Delhi',
            NULL,
            'NY',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Geneseo',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Morrisville',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at New Paltz',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Old Westbury',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Oneonta',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Oswego',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York at Potsdam',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York Maritime College',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'State University of New York Polytechnic Institute',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'The City College of New York',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'The State University of New York at Fredonia',
            NULL,
            'NY',
            'd3',
            'State University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'U.S. Merchant Marine Academy',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'Union College',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'University of Mount Saint Vincent',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'University of Rochester',
            NULL,
            'NY',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Utica University',
            NULL,
            'NY',
            'd3',
            'Empire 8',
            ARRAY[]::text[]
        ),
(
            'Vassar College',
            NULL,
            'NY',
            'd3',
            'Liberty League',
            ARRAY[]::text[]
        ),
(
            'Yeshiva University',
            NULL,
            'NY',
            'd3',
            'Skyline Conference',
            ARRAY[]::text[]
        ),
(
            'York College',
            NULL,
            'NY',
            'd3',
            'City University of New York Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Baldwin Wallace University',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bluffton University',
            NULL,
            'OH',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Capital University',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Case Western Reserve University',
            NULL,
            'OH',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Denison University',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Franciscan University of Steubenville',
            NULL,
            'OH',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Heidelberg University',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hiram College',
            NULL,
            'OH',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'John Carroll University',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Kenyon College',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Marietta College',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mount St. Joseph University',
            NULL,
            'OH',
            'd3',
            'Heartland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Muskingum University',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Oberlin College',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ohio Northern University',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ohio Wesleyan University',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Otterbein University',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'The College of Wooster',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Mount Union',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wilmington College',
            NULL,
            'OH',
            'd3',
            'Ohio Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wittenberg University',
            NULL,
            'OH',
            'd3',
            'North Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'George Fox University',
            NULL,
            'OR',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Lewis & Clark College',
            NULL,
            'OR',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Linfield University',
            NULL,
            'OR',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Pacific University',
            NULL,
            'OR',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Willamette University',
            NULL,
            'OR',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Albright College',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Allegheny College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Alvernia University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Arcadia University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Bryn Mawr College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Cairn University',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Carlow University',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Carnegie Mellon University',
            NULL,
            'PA',
            'd3',
            'University Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Cedar Crest College',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Chatham University',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Delaware Valley University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'DeSales University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Dickinson College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Elizabethtown College',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Franklin & Marshall College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Geneva College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Gettysburg College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Grove City College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Gwynedd Mercy University',
            NULL,
            'PA',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Haverford College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Immaculata University',
            NULL,
            'PA',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Juniata College',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Keystone College',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'King''s College',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'La Roche University',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Lancaster Bible College',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Lebanon Valley College',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Lycoming College',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Marywood University',
            NULL,
            'PA',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Messiah University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Misericordia University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Moravian University',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Aloysius College',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Muhlenberg College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Neumann University',
            NULL,
            'PA',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Penn State Berks College',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Penn State Brandywine',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Penn State Harrisburg',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Penn State University, Abington',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Penn State University, Altoona',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Pennsylvania College of Technology',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Pennsylvania State Univ. Erie, the Behrend College',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Rosemont College',
            NULL,
            'PA',
            'd3',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'Saint Vincent College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Susquehanna University',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Swarthmore College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Thiel College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Pittsburgh, Bradford',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Pittsburgh, Greensburg',
            NULL,
            'PA',
            'd3',
            'Allegheny Mountain Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Scranton',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'University of Valley Forge',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'Ursinus College',
            NULL,
            'PA',
            'd3',
            'Centennial Conference',
            ARRAY[]::text[]
        ),
(
            'Washington and Jefferson College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Waynesburg University',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Westminster College',
            NULL,
            'PA',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Widener University',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Wilkes University',
            NULL,
            'PA',
            'd3',
            'Landmark Conference',
            ARRAY[]::text[]
        ),
(
            'Wilson College',
            NULL,
            'PA',
            'd3',
            'United East Conference',
            ARRAY[]::text[]
        ),
(
            'York College',
            NULL,
            'PA',
            'd3',
            'Middle Atlantic Conferences',
            ARRAY[]::text[]
        ),
(
            'Johnson & Wales University',
            NULL,
            'RI',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Rhode Island College',
            NULL,
            'RI',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Roger Williams University',
            NULL,
            'RI',
            'd3',
            'Conference of New England',
            ARRAY[]::text[]
        ),
(
            'Salve Regina University',
            NULL,
            'RI',
            'd3',
            'New England Women''s and Men''s Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Maryville College',
            NULL,
            'TN',
            'd3',
            'Collegiate Conference of the South',
            ARRAY[]::text[]
        ),
(
            'Rhodes College',
            NULL,
            'TN',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'University of the South',
            NULL,
            'TN',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Austin College',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Concordia University Texas',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'East Texas Baptist University',
            NULL,
            'TX',
            'd3',
            'American Southwest Conference',
            ARRAY[]::text[]
        ),
(
            'Hardin-Simmons University',
            NULL,
            'TX',
            'd3',
            'American Southwest Conference',
            ARRAY[]::text[]
        ),
(
            'Howard Payne University',
            NULL,
            'TX',
            'd3',
            'American Southwest Conference',
            ARRAY[]::text[]
        ),
(
            'LeTourneau University',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'McMurry University',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Schreiner University',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Southwestern University',
            NULL,
            'TX',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'Sul Ross State University',
            NULL,
            'TX',
            'd3',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Texas Lutheran University',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Trinity University',
            NULL,
            'TX',
            'd3',
            'Southern Athletic Association',
            ARRAY[]::text[]
        ),
(
            'University of Dallas',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Mary Hardin-Baylor',
            NULL,
            'TX',
            'd3',
            'American Southwest Conference',
            ARRAY[]::text[]
        ),
(
            'University of St. Thomas',
            NULL,
            'TX',
            'd3',
            'Southern Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Texas at Dallas',
            NULL,
            'TX',
            'd3',
            'Lone Star Conference',
            ARRAY[]::text[]
        ),
(
            'Averett University',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Bridgewater College',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Christopher Newport University',
            NULL,
            'VA',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Mennonite University',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Ferrum College',
            NULL,
            'VA',
            'd3',
            'Conference Carolinas',
            ARRAY[]::text[]
        ),
(
            'Hampden-Sydney College',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Hollins University',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Mary Baldwin University',
            NULL,
            'VA',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Marymount University',
            NULL,
            'VA',
            'd3',
            'Atlantic East Conference',
            ARRAY[]::text[]
        ),
(
            'Randolph College',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Randolph-Macon College',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Regent University',
            NULL,
            'VA',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Roanoke College',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Shenandoah University',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Southern Virginia University',
            NULL,
            'VA',
            'd3',
            'USA South Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Sweet Briar College',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Lynchburg',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'University of Mary Washington',
            NULL,
            'VA',
            'd3',
            'Coast-To-Coast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Virginia Wesleyan University',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Washington and Lee University',
            NULL,
            'VA',
            'd3',
            'Old Dominion Athletic Conf.',
            ARRAY[]::text[]
        ),
(
            'Middlebury College',
            NULL,
            'VT',
            'd3',
            'New England Small College Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Norwich University',
            NULL,
            'VT',
            'd3',
            'Great Northeast Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Vermont State University Castleton',
            NULL,
            'VT',
            'd3',
            'Little East Conference',
            ARRAY[]::text[]
        ),
(
            'Vermont State University Lyndon',
            NULL,
            'VT',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Vermont State University-Johnson',
            NULL,
            'VT',
            'd3',
            'North Atlantic Conference',
            ARRAY[]::text[]
        ),
(
            'Pacific Lutheran University',
            NULL,
            'WA',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'University of Puget Sound',
            NULL,
            'WA',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Whitman College',
            NULL,
            'WA',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Whitworth University',
            NULL,
            'WA',
            'd3',
            'Northwest Conference',
            ARRAY[]::text[]
        ),
(
            'Alverno College',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Beloit College',
            NULL,
            'WI',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Carroll University',
            NULL,
            'WI',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Carthage College',
            NULL,
            'WI',
            'd3',
            'College Conference of Illinois & Wisconsin',
            ARRAY[]::text[]
        ),
(
            'Concordia University Wisconsin',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Edgewood University',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Lakeland University',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Lawrence University',
            NULL,
            'WI',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Maranatha Baptist University',
            NULL,
            'WI',
            'd3',
            'Independent',
            ARRAY[]::text[]
        ),
(
            'Marian University',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Milwaukee School of Engineering',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Ripon College',
            NULL,
            'WI',
            'd3',
            'Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'St. Norbert College',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Eau Claire',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-La Crosse',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Oshkosh',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Platteville',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-River Falls',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Stevens Point',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Stout',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Superior',
            NULL,
            'WI',
            'd3',
            'Upper Midwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Wisconsin-Whitewater',
            NULL,
            'WI',
            'd3',
            'Wisconsin Intercollegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wisconsin Lutheran College',
            NULL,
            'WI',
            'd3',
            'Northern Athletics Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Bethany College',
            NULL,
            'WV',
            'd3',
            'Presidents'' Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bevill State Community College',
            'Sumiton',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bishop State Community College',
            'Mobile',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Calhoun Community College',
            'Tanner',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Central Alabama Community College',
            'Alexander City',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Chattahoochee Valley Community College',
            'Phenix City',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Coastal Alabama Community College',
            'Bay Minette',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Coastal Alabama Community College Brewton',
            'Brewton',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Coastal Alabama Community College Monroeville',
            'Monroeville',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Enterprise-Ozark Community College',
            'Enterprise',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gadsden State Community College',
            'Gadsden',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lawson State Community College',
            'Birmingham',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lurleen B. Wallace Community College',
            'Andalusia',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Marion Military Institute',
            'Marion',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Shelton State Community College',
            'Tuscaloosa',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Snead State Community College',
            'Boaz',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southern Union State Community College',
            'Wadley',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wallace Community College',
            'Dothan',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wallace Community College Selma',
            'Selma',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wallace State Community College',
            'Hanceville',
            'AL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Arkansas State University Mid-South',
            'West Memphis',
            'AR',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Arkansas State University-Newport',
            'Newport',
            'AR',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Arkansas College',
            'Harrison',
            'AR',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Arizona Western College',
            'Yuma',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Central Arizona College',
            'Coolidge',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Chandler-Gilbert Community College',
            'Chandler',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cochise College',
            'Douglas',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Eastern Arizona College',
            'Thatcher',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Glendale Community College',
            'Glendale',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mesa Community College',
            'Mesa',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Phoenix College',
            'Phoenix',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pima Community College',
            'Tucson',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Scottsdale Community College',
            'Scottsdale',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'South Mountain Community College',
            'Phoenix',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Yavapai College',
            'Prescott',
            'AZ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Colorado Northwestern Community College',
            'Rangely',
            'CO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lamar Community College',
            'Lamar',
            'CO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northeastern Junior College',
            'Sterling',
            'CO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Otero College',
            'La Junta',
            'CO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Trinidad State College',
            'Trinidad',
            'CO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gateway Community College',
            'New Haven',
            'CT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'University of Connecticut at Avery Point',
            'Groton',
            'CT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Delaware Technical Community College-Owens Campus',
            'Georgetown',
            'DE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Delaware Technical Community College-Stanton-Wilmington Campus',
            'Stanton',
            'DE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Delaware Technical Community College-Terry Campus',
            'Dover',
            'DE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'ASA College',
            'Miami',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Broward College',
            'Fort Lauderdale',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Chipola College',
            'Marianna',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'College of Central Florida',
            'Ocala',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Daytona State College',
            'Daytona Beach',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Eastern Florida State College',
            'Brevard County (formerly known as Brevard Community College)',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Florida Gateway College',
            'Lake City',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Florida SouthWestern State College',
            'Fort Myers (formerly known as Edison Community College)',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Florida State College at Jacksonville',
            'Jacksonville',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gulf Coast State College',
            'Panama City',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hillsborough Community College',
            'Tampa',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Indian River State College',
            'Fort Pierce',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lake–Sumter State College',
            'Leesburg',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Miami-Dade College',
            'Miami',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Florida Community College',
            'Madison',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northwest Florida State College',
            'Niceville',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Palm Beach State College',
            'Lake Worth',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pasco–Hernando State College',
            'New Port Richey',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pensacola State College',
            'Pensacola',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Polk State College',
            'Winter Haven',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Santa Fe College',
            'Gainesville',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Seminole State College of Florida',
            'Sanford',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'South Florida State College',
            'Avon Park',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'St. Johns River State College',
            'Palatka',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'St. Petersburg College',
            'St. Petersburg',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'State College of Florida, Manatee–Sarasota',
            'Bradenton (formerly known as Manatee Community College)',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Tallahassee Community College',
            'Tallahassee',
            'FL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Albany Technical College',
            'Albany',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Atlanta Metropolitan College',
            'Atlanta',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Chattahoochee Technical College',
            'Marietta',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'East Georgia College',
            'Swainsboro',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Georgia Highlands College',
            'Rome',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Georgia Military College',
            'Milledgeville',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gordon State College',
            'Barnesville',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Oxford College of Emory University',
            'Oxford',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'South Georgia Technical College',
            'Americus',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Waycross College',
            'Waycross',
            'GA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Clinton Community College',
            'Clinton',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Des Moines Area Community College',
            'Boone',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Ellsworth Community College',
            'Iowa Falls',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hawkeye Community College',
            'Waterloo',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Indian Hills Community College-Ottumwa',
            'Ottumwa (Falcons in Baseball)',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Iowa Central Community College',
            'Fort Dodge',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Iowa Lakes Community College',
            'Estherville',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Iowa Western Community College',
            'Council Bluffs',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kirkwood Community College',
            'Cedar Rapids',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Marshalltown Community College',
            'Marshalltown',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Iowa Area Community College',
            'Mason City',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southwestern Community College',
            'Creston',
            'IA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'College of Southern Idaho',
            'Twin Falls',
            'ID',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Idaho College',
            'Coeur d''Alene',
            'ID',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Black Hawk College-Moline',
            'Moline',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Carl Sandburg College',
            'Galesburg',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'College of DuPage',
            'Glen Ellyn',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'College of Lake County',
            'Grayslake',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Danville Area Community College',
            'Danville',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Elgin Community College',
            'Elgin',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Frontier Community College',
            'Fairfield',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Harper College',
            'Palatine',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Heartland Community College',
            'Normal',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Illinois Central College',
            'East Peoria',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Illinois Valley Community College',
            'Oglesby',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'John A. Logan College',
            'Carterville',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'John Wood Community College',
            'Quincy',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Joliet Junior College',
            'Joliet',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kaskaskia College',
            'Centralia',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kishwaukee College',
            'Malta',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lake Land College',
            'Mattoon',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lewis & Clark Community College',
            'Godfrey',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lincoln Land Community College',
            'Springfield',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lincoln Trail College',
            'Robinson',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'McHenry County College',
            'Crystal Lake',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Moraine Valley Community College',
            'Palos Hills',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Morton College',
            'Cicero',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Oakton Community College',
            'Des Plaines',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Olive-Harvey College',
            'Chicago',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Olney Central College',
            'Olney',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Parkland College',
            'Champaign',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Prairie State College',
            'Chicago Heights',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Rend Lake College',
            'Ina',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Rock Valley College',
            'Rockford',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Sauk Valley Community College',
            'Dixon',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Shawnee Community College',
            'Ullin',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'South Suburban College',
            'South Holland',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southeastern Illinois College',
            'Harrisburg',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southwestern Illinois College',
            'Belleville',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Spoon River College',
            'Canton',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Triton College',
            'River Grove',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wabash Valley College',
            'Mount Carmel',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Waubonsee Community College',
            'Sugar Grove',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wilbur Wright College',
            'Chicago',
            'IL',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Ancilla College',
            'Donaldson',
            'IN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Vincennes University',
            'Vincennes',
            'IN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Allen Community College',
            'Iola',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Barton County Community College',
            'Great Bend',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Brown Mackie College',
            'Salina',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Butler County Community College',
            'El Dorado',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cloud County Community College',
            'Concordia',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Coffeyville Community College',
            'Coffeyville',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Colby Community College',
            'Colby',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cowley County Community College',
            'Arkansas City',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Dodge City Community College',
            'Dodge City',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Fort Scott Community College',
            'Fort Scott',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Garden City Community College',
            'Garden City',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Highland Community College',
            'Highland (http://www.highlandcc.edu/)',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hutchinson Community College',
            'Hutchinson',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Independence Community College',
            'Independence',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Johnson County Community College',
            'Overland Park',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northwest Kansas Technical College',
            'Goodland',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pratt Community College',
            'Pratt',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Seward County Community College',
            'Liberal',
            'KS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Elizabethtown Community and Technical College',
            'Elizabethtown',
            'KY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Simmons College of Kentucky',
            'Louisville',
            'KY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Baton Rouge Community College',
            'Baton Rouge',
            'LA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bossier Parish Community College',
            'Bossier',
            'LA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Delgado Community College',
            'New Orleans',
            'LA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Louisiana State University at Eunice',
            'Eunice',
            'LA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southern University at Shreveport',
            'Shreveport',
            'LA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Benjamin Franklin Institute of Technology',
            'Boston',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bristol Community College',
            'Fall River',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bunker Hill Community College',
            'Charlestown',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Holyoke Community College',
            'Holyoke',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mass Bay Community College',
            'Wellesley',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Massasoit Community College',
            'Brockton',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northern Essex Community College',
            'Haverhill',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Quinsigamond Community College',
            'Worcester',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Roxbury Community College',
            'Boston',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Springfield Technical Community College',
            'Springfield',
            'MA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Allegany College of Maryland',
            'Cumberland',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Anne Arundel Community College',
            'Arnold',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Baltimore City Community College',
            'Baltimore',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Carroll Community College',
            'Westminster',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'CCBC-Catonsville',
            'Catonsville',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'CCBC-Dundalk',
            'Dundalk',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'CCBC-Essex',
            'Essex',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cecil College',
            'North East',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Chesapeake College',
            'Wye Mills',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'College of Southern Maryland',
            'La Plata',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Frederick Community College',
            'Frederick',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Garrett College',
            'McHenry',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hagerstown Community College',
            NULL,
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Harford Community College',
            'Bel Air',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Howard Community College',
            'Columbia',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Montgomery College',
            'Germantown, Rockville, and Takoma Park/Silver Spring',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Prince George''s Community College',
            'Largo',
            'MD',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Alpena Community College',
            'Alpena',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bay de Noc Community College',
            'Escanaba',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Delta College',
            'University Center',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Detroit Community Christian College',
            'Detroit',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Glen Oaks Community College',
            'Centreville',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gogebic Community College',
            'Ironwood',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Grand Rapids Community College',
            'Grand Rapids',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Henry Ford College',
            'Dearborn',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jackson College',
            'Jackson',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kellogg Community College',
            'Battle Creek',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kirtland Community College',
            'Roscommon',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lake Michigan College',
            'Benton Harbor',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lansing Community College',
            'Lansing',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Macomb Community College',
            'Warren',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mott Community College',
            'Flint',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Muskegon Community College',
            'Muskegon',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Central Michigan College',
            'Petoskey',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Oakland Community College',
            'Bloomfield Hills',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Schoolcraft College',
            'Garden City',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'St. Clair County Community College',
            'Port Huron',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wayne County Community College',
            'Detroit',
            'MI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Anoka-Ramsey Community College',
            'Coon Rapids',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Central Lakes College',
            'Brainerd',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Dakota County Technical College',
            'Rosemount',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hibbing Community College',
            'Hibbing',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Itasca Community College',
            'Grand Rapids',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mesabi Range College',
            'Virginia',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Minneapolis Community & Technical College',
            'Minneapolis',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Minnesota State Community & Technical College',
            'Fergus Falls',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Minnesota West Community & Technical College',
            'Worthington',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northland Community & Technical College',
            'Thief River Falls',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Rainy River Community College',
            'International Falls',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Ridgewater College',
            'Wilmar',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Riverland Community College',
            'Austin',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Rochester Community & Technical College',
            'Rochester',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Vermilion Community College',
            'Ely',
            'MN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cottey College',
            'Nevada',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Crowder College',
            'Neosho',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Metropolitan Community College-Longview',
            'Lee''s Summit',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Metropolitan Community College-Penn Valley',
            'Kansas City',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mineral Area College',
            'Park Hills',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Missouri State University-West Plains',
            'West Plains',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Moberly Area Community College',
            'Moberly',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Central Missouri College',
            'Trenton',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'St. Charles Community College',
            'Saint Charles',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'St. Louis Community College',
            'Florissant Valley (men’s soccer), Forest Park (men’s/women’s basketball), Meramec (baseball, softball, women’s soccer and volleyball)',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'State Fair Community College',
            'Sedalia',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Three Rivers Community College',
            'Poplar Bluff',
            'MO',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Coahoma Community College',
            'Clarksdale',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Copiah-Lincoln Community College',
            'Wesson',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'East Central Community College',
            'Decatur',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'East Mississippi Community College',
            'Scooba',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hinds Community College',
            'Raymond',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Holmes Community College',
            'Goodman',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Itawamba Community College',
            'Fulton',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jones County Junior College',
            'Ellisville',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Meridian Community College',
            'Meridian',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mississippi Delta Community College',
            'Moorhead',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mississippi Gulf Coast Community College',
            'Perkinston',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northeast Mississippi Community College',
            'Booneville',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northwest Mississippi Community College',
            'Senatobia',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pearl River Community College',
            'Poplarville',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southwest Mississippi Community College',
            'Summit',
            'MS',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Dawson Community College',
            'Glendive',
            'MT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Little Big Horn College',
            'Crow Agency',
            'MT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Miles Community College',
            'Miles City',
            'MT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Brunswick Community College',
            'Bolivia',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Caldwell Community College & Technical Institute',
            'Caldwell',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cape Fear Community College',
            'Wilmington',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Catawba Valley Community College',
            'Hickory',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Central Carolina Community College',
            'Sanford',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Davidson County Community College',
            'Lexington',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Fayetteville Technical Community College',
            'Fayetteville',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gaston College',
            NULL,
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Guilford Technical Community College',
            'Jamestown',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lenoir Community College',
            'Kinston',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Louisburg College',
            'Louisburg',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pitt Community College',
            'Winterville',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Roanoke-Chowan Community College',
            'Ahoskie',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Rockingham Community College',
            'Wentworth',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Sandhills Community College',
            'Pinehurst',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Surry Community College',
            'Dobson',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Vance-Granville Community College',
            'Henderson',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Vance–Granville Community College',
            'Henderson',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wake Technical Community College',
            'Raleigh',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wilkes Community College',
            'Wilkesboro',
            'NC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Dakota College at Bottineau',
            'Bottineau',
            'ND',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lake Region State College',
            'Devils Lake',
            'ND',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Dakota State College of Science',
            'Wahpeton',
            'ND',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'United Tribes Technical College',
            'Bismarck',
            'ND',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Williston State College',
            'Williston',
            'ND',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Central Community College at Columbus',
            'Columbus',
            'NE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'McCook Community College',
            'McCook',
            'NE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Platte Community College',
            'North Platte',
            'NE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northeast Community College',
            'Norfolk',
            'NE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southeast Community College',
            'Lincoln',
            'NE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Western Nebraska Community College',
            'Scotts Bluff',
            'NE',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Atlantic Cape Community College',
            'Mays Landing',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bergen Community College',
            'Paramus',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Brookdale Community College',
            'Lincroft',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Burlington County College',
            'Pemberton',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Camden County College',
            'Blackwood',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'County College of Morris',
            'Randolph',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Essex County College',
            'Newark',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Gloucester County College',
            'Sewell',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mercer County Community College',
            'Trenton',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Middlesex County College',
            'Edison',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Ocean County College',
            'Toms River',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Passaic County Community College',
            'Paterson',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Raritan Valley Community College',
            'North Branch',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Salem Community College',
            'Carneys Point',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Sussex County Community College',
            'Newton',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Union College',
            'Cranford',
            'NJ',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mesalands Community College',
            'Tucumcari',
            'NM',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'New Mexico Junior College',
            'Hobbs',
            'NM',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'New Mexico Military Institute',
            'Roswell',
            'NM',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'College of Southern Nevada',
            'Henderson',
            'NV',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Western Nevada College',
            'Carson City',
            'NV',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Adirondack Community College',
            'Queensbury',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Borough of Manhattan Community College',
            'New York City',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bronx Community College',
            'University Heights',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Broome Community College',
            'Binghamton',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cayuga Community College',
            'Auburn',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Clinton Community College, New York',
            'Plattsburgh',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Columbia-Greene Community College',
            'Hudson',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Corning Community College',
            'Corning',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Dutchess Community College',
            'Poughkeepsie',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Erie Community College',
            'Buffalo',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Fashion Institute of Technology',
            'New York City',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Finger Lakes Community College',
            'Canandaigua',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Fulton-Montgomery Community College',
            'Johnstown',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Genesee Community College',
            'Batavia',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Herkimer County Community College',
            'Herkimer',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hostos Community College',
            'Bronx',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hudson Valley Community College',
            'Troy',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jamestown Community College',
            'Jamestown',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jamestown Community College-Cattaraugus',
            'Olean',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jefferson Community College',
            'Watertown',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kingsborough Community College',
            'Brooklyn',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'LaGuardia Community College',
            'Queens',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mohawk Valley Community College',
            'Utica',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Monroe Community College',
            'Rochester',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Monroe University',
            'New Rochelle',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Nassau Community College',
            'Garden City',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Country Community College',
            'Saranac',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Onondaga Community College',
            'Syracuse',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Orange County Community College',
            'Middletown',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Queensborough Community College',
            'Queens',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Rockland Community College',
            'Viola',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Schenectady County Community College',
            'Schenectady',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Suffolk County Community College',
            'Selden',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Sullivan County Community College',
            'Loch Sheldrake',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'SUNY Niagara',
            'Sanborn',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Tompkins Cortland Community College',
            'Dryden',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Ulster County Community College',
            'Stone Ridge',
            'NY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bryant & Stratton College',
            'Solon',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cincinnati State Technical & Community College',
            'Cincinnati',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Clark State Community College',
            'Springfield',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Columbus State Community College',
            'Columbus',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cuyahoga Community College',
            'Parma',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Edison Community College',
            'Piqua',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Hocking College',
            'Nelsonville',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lakeland Community College',
            'Kirtland',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lorain County Community College',
            'Elyria',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Owens Community College',
            'Perrysburg',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Sinclair Community College',
            'Dayton',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Terra State Community College',
            'Fremont',
            'OH',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cal Albert State',
            NULL,
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Carl Albert State College',
            'Poteau',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Connors State College',
            'Conner',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Eastern Oklahoma State College',
            'Wilburton',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Murray State',
            NULL,
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Murray State College',
            'Tishomingo',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Noc Enid Jets',
            NULL,
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Noc Tonkawa',
            NULL,
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northeastern Oklahoma A&M College',
            'Miami',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northern Oklahoma College Enid',
            'Enid',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northern Oklahoma College-Tonkawa',
            'Tonkawa',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Redlands Community College',
            'El Reno',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Seminole State College',
            'Seminole',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Western Oklahoma State College',
            'Altus',
            'OK',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Butler County Community College',
            'Butler',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Community College of Allegheny County',
            'Pittsburgh',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Community College of Beaver County',
            'Monaca',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Harcum College',
            'Bryn Mawr',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lackawanna College',
            'Scranton',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northampton Community College',
            'Bethlehem',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Thaddeus Stevens College of Technology',
            'Lancaster',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Westmoreland County Community College',
            'Youngwood',
            'PA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Community College of Rhode Island',
            'Warwick',
            'RI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Aiken Technical College',
            'Aiken',
            'SC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Clinton Junior College',
            'Rock Hill',
            'SC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Denmark Technical College',
            'Denmark',
            'SC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina Lancaster',
            'Lancaster',
            'SC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina Salkehatchie',
            'Allendale',
            'SC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'University of South Carolina Sumter',
            'Sumter',
            'SC',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Chattanooga State Technical Community College',
            'Chattanooga',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cleveland State Community College',
            'Cleveland',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Columbia State Community College',
            'Columbia',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Dyersburg State Community College',
            'Dyersburg',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jackson State Community College',
            'with the Green Jays at JSCC |url=https://www.jacksonsun.com/story/news/local/2018/08/22/out-generals-green-jays-jscc/1060303002/ |website=Jackson Sun |accessdate=November 14, 2020 |date=August 22, 2018}}</ref> in Jackson',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Motlow State Community College',
            'Lynchburg',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Pellissippi State Community College',
            'Knoxville',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Roane State Community College',
            'Harriman',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southwest Tennessee Community College',
            'Memphis',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Volunteer State Community College',
            'Gallatin',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Walters State Community College',
            'Morristown',
            'TN',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Angelina College',
            'Lufkin',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Blinn College',
            'Brenham',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Brookhaven College',
            'Farmers Branch',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cedar Valley College',
            'Lancaster',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Cisco College',
            'Cisco',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Clarendon College',
            'Clarendon',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Coastal Bend College',
            'Beeville',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Collin College',
            'Collin County',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Eastfield College',
            'Mesquite',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Frank Phillips College',
            'Borger',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Grayson County College',
            'Denison',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Hill College',
            'Hillsboro',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Howard College',
            'Big Spring',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Jacksonville College',
            'Jacksonville',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Kilgore College',
            'Kilgore',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Lee College',
            'Baytown',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'McLennan Community College',
            'Waco',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Midland College',
            'Midland',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mountain View College',
            'Dallas',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Navarro College',
            'Corsicana',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'North Lake College',
            'Irving',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northeast Texas Community College',
            'Mount Pleasant',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Odessa College',
            'Odessa',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Panola College',
            'Carthage',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Paris Junior College',
            'Paris',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Ranger College',
            'Ranger',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Richland College',
            'Dallas',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'San Jacinto College-Central',
            'Pasadena',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'South Plains College',
            'Lubbock',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Southwestern Christian College',
            'Terrell',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Temple College',
            'Temple',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Trinity Valley Community College',
            'Athens',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Tyler Junior College',
            'Tyler',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Western Texas College',
            'Snyder',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Wharton County Junior College',
            'Wharton',
            'TX',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Salt Lake Community College',
            'Salt Lake',
            'UT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Snow College',
            'Ephraim',
            'UT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Utah State University Eastern',
            'Price',
            'UT',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bryant and Stratton College',
            'Virginia Beach',
            'VA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Danville Community College',
            'Danville',
            'VA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northern Virginia Community College',
            'Annandale',
            'VA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Patrick & Henry Community College',
            'Martinsville',
            'VA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Thomas Nelson Community College',
            'Hampton',
            'VA',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Bryant & Stratton College',
            'Milwaukee',
            'WI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Madison Area Technical College',
            'Madison',
            'WI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Mid-State Technical College',
            'Marshfield',
            'WI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Milwaukee Area Technical College',
            'Milwaukee',
            'WI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Western Technical College',
            'LaCrosse',
            'WI',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Potomac State College',
            'Keyser',
            'WV',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Potomac State College of West Virginia University',
            'Keyser',
            'WV',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Casper College',
            'Casper',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Central Wyoming College',
            'Riverton',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Eastern Wyoming College',
            'Torrington',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Laramie County Community College',
            'Cheyenne',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Northwest College',
            'Powell',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Sheridan College',
            'Gillette',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Western Wyoming Community College',
            'Rock Springs',
            'WY',
            'juco',
            'NJCAA',
            ARRAY[]::text[]
        ),
(
            'Savannah College of Art and Design–Atlanta',
            '17,575',
            'AA',
            'naia',
            NULL,
            ARRAY[]::text[]
        ),
(
            'Faulkner University',
            'Montgomery',
            'AL',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Oakwood University',
            'Huntsville',
            'AL',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Stillman College',
            'Tuscaloosa',
            'AL',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Talladega College',
            'Talladega',
            'AL',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Mobile',
            'Prichard',
            'AL',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Arkansas Baptist College',
            'Little Rock',
            'AR',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Central Baptist College',
            'Conway',
            'AR',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Crowley''s Ridge College',
            'Paragould',
            'AR',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'John Brown University',
            'Siloam Springs',
            'AR',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Philander Smith University',
            'Little Rock',
            'AR',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Williams Baptist University',
            'Walnut Ridge',
            'AR',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Arizona Christian University',
            'Phoenix',
            'AZ',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Benedictine University at Mesa',
            'Mesa',
            'AZ',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Embry–Riddle Aeronautical University, Prescott',
            'Prescott',
            'AZ',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ottawa University Arizona',
            'Surprise',
            'AZ',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Park University Gilbert',
            'Gilbert',
            'AZ',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Trinity Western University',
            'Langley',
            'BC',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of British Columbia',
            'Vancouver',
            'BC',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'University of Victoria',
            'Victoria',
            'BC',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Cal Poly Maritime Academy',
            'Vallejo',
            'CA',
            'naia',
            'California Pacific Conference',
            ARRAY[]::text[]
        ),
(
            'Hope International University',
            'Fullerton',
            'CA',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'La Sierra University',
            'Riverside',
            'CA',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Life Pacific University',
            'San Dimas',
            'CA',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Pacific Union College',
            'Angwin',
            'CA',
            'naia',
            'California Pacific Conference',
            ARRAY[]::text[]
        ),
(
            'Simpson University',
            'Redding',
            'CA',
            'naia',
            'California Pacific Conference',
            ARRAY[]::text[]
        ),
(
            'Soka University of America',
            'Aliso Viejo',
            'CA',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Stanton University',
            'Anaheim',
            'CA',
            'naia',
            'California Pacific Conference',
            ARRAY[]::text[]
        ),
(
            'The Master''s University',
            'Santa Clarita',
            'CA',
            'naia',
            'Great Southwest Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Westcliff University',
            'Irvine',
            'CA',
            'naia',
            'California Pacific Conference',
            ARRAY[]::text[]
        ),
(
            'Ave Maria University',
            'Ave Maria',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Florida College',
            'Temple Terrace',
            'FL',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Florida Memorial University',
            'Miami Gardens',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Florida National University',
            'Miami',
            'FL',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Keiser University',
            'West Palm Beach',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'New College of Florida',
            'Sarasota',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Southeastern University',
            'Lakeland',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'St. Thomas University',
            'Miami Gardens',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Warner University',
            'Lake Wales',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Webber International University',
            'Babson Park',
            'FL',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Abraham Baldwin Agricultural College',
            'Tifton',
            'GA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Brenau University',
            'Gainesville',
            'GA',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Brewton–Parker Christian University',
            'Mount Vernon',
            'GA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'College of Coastal Georgia',
            'Brunswick',
            'GA',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Dalton State College',
            'Dalton',
            'GA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Georgia Gwinnett College',
            'Lawrenceville',
            'GA',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Life University',
            'Marietta',
            'GA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Point University',
            'West Point',
            'GA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Reinhardt University',
            'Waleska',
            'GA',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Thomas University',
            'Thomasville',
            'GA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Truett McConnell University',
            'Cleveland',
            'GA',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Briar Cliff University',
            'Sioux City',
            'IA',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Clarke University',
            'Dubuque',
            'IA',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Dordt University',
            'Sioux Center',
            'IA',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Graceland University',
            'Lamoni',
            'IA',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Grand View University',
            'Des Moines',
            'IA',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Morningside University',
            'Sioux City',
            'IA',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Mercy University',
            'Cedar Rapids',
            'IA',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northwestern College',
            'Orange City',
            'IA',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'St. Ambrose University',
            'Davenport',
            'IA',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Waldorf University',
            'Forest City',
            'IA',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'William Penn University',
            'Oskaloosa',
            'IA',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'College of Idaho',
            'Caldwell',
            'ID',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Lewis–Clark State College',
            'Lewiston',
            'ID',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Governors State University',
            'University Park',
            'IL',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Judson University',
            'Elgin',
            'IL',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Olivet Nazarene University',
            'Bourbonnais',
            'IL',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Xavier University',
            'Chicago',
            'IL',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of St. Francis',
            'Joliet',
            'IL',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bethel University',
            'Mishawaka',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Calumet College of St. Joseph',
            'Whiting',
            'IN',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Goshen College',
            'Goshen',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Grace College & Seminary',
            'Winona Lake',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Holy Cross College',
            'Notre Dame',
            'IN',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Huntington University',
            'Huntington',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Indiana Institute of Technology',
            'Fort Wayne',
            'IN',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University Columbus',
            'Columbus',
            'IN',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University East',
            'Richmond',
            'IN',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University Kokomo',
            'Kokomo',
            'IN',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University Northwest',
            'Gary',
            'IN',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University South Bend',
            'South Bend',
            'IN',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana University Southeast',
            'New Albany',
            'IN',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Indiana Wesleyan University',
            'Marion',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Marian University',
            'Indianapolis',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Oakland City University',
            'Oakland City',
            'IN',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Saint Mary-of-the-Woods College',
            'Saint Mary''s',
            'IN',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Taylor University',
            'Upland',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'University of Saint Francis',
            'Fort Wayne',
            'IN',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'Baker University',
            'Baldwin City',
            'KS',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Benedictine College',
            'Atchison',
            'KS',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bethany College',
            'Lindsborg',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bethel College',
            'North Newton',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Central Christian College of Kansas',
            'McPherson',
            'KS',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Friends University',
            'Wichita',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Haskell Indian Nations University',
            'Lawrence',
            'KS',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hesston College',
            'Hesston',
            'KS',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Kansas Wesleyan University',
            'Salina',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'McPherson College',
            'McPherson',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'MidAmerica Nazarene University',
            'Olathe',
            'KS',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Ottawa University',
            'Ottawa',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Southwestern College',
            'Winfield',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Sterling College',
            'Sterling',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Tabor College',
            'Hillsboro',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Saint Mary',
            'Leavenworth',
            'KS',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Alice Lloyd College',
            'Pippa Passes',
            'KY',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Brescia University',
            'Owensboro',
            'KY',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Campbellsville University',
            'Campbellsville',
            'KY',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Georgetown College',
            'Georgetown',
            'KY',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Kentucky Christian University',
            'Grayson',
            'KY',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Lindsey Wilson University',
            'Columbia',
            'KY',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Midway University',
            'Midway',
            'KY',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Union Commonwealth University',
            'Barbourville',
            'KY',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Pikeville',
            'Pikeville',
            'KY',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of the Cumberlands',
            'Williamsburg',
            'KY',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Dillard University',
            'New Orleans',
            'LA',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Louisiana Christian University',
            'Pineville',
            'LA',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Louisiana State University at Alexandria',
            'Alexandria',
            'LA',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Louisiana State University in Shreveport',
            'Shreveport',
            'LA',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Loyola University New Orleans',
            'New Orleans',
            'LA',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Southern University at New Orleans',
            'New Orleans',
            'LA',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Xavier University of Louisiana',
            'New Orleans',
            'LA',
            'naia',
            'Red River Athletic Conference<br>',
            ARRAY[]::text[]
        ),
(
            'Fisher College',
            'Boston',
            'MA',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Washington Adventist University',
            'Takoma Park',
            'MD',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Aquinas College',
            'Grand Rapids',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Cleary University',
            'Howell',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Cornerstone University',
            'Grand Rapids',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Lawrence Technological University',
            'Southfield',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Madonna University',
            'Livonia',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rochester Christian University',
            'Rochester',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Spring Arbor University',
            'Spring Arbor',
            'MI',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'University of Michigan–Dearborn',
            'Dearborn',
            'MI',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Avila University',
            'Kansas City',
            'MO',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Central Methodist University',
            'Fayette',
            'MO',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'College of the Ozarks',
            'Point Lookout',
            'MO',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Columbia College',
            'Columbia',
            'MO',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Cottey College',
            'Nevada',
            'MO',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Culver–Stockton College',
            'Canton',
            'MO',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Evangel University',
            'Springfield',
            'MO',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hannibal–LaGrange University',
            'Hannibal',
            'MO',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Harris–Stowe State University',
            NULL,
            'MO',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Mission University',
            'Springfield',
            'MO',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'Missouri Baptist University',
            NULL,
            'MO',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Missouri Valley College',
            'Marshall',
            'MO',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Park University',
            'Parkville',
            'MO',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Stephens College',
            'Columbia',
            'MO',
            'naia',
            'American Midwest Conference',
            ARRAY[]::text[]
        ),
(
            'William Woods University',
            'Fulton',
            'MO',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Blue Mountain Christian University',
            'Blue Mountain',
            'MS',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Rust College',
            'Holly Springs',
            'MS',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Tougaloo College',
            'Tougaloo',
            'MS',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'William Carey University',
            'Hattiesburg',
            'MS',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Carroll College',
            'Helena',
            'MT',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Montana State University–Northern',
            'Havre',
            'MT',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Montana Technological University',
            'Butte',
            'MT',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Rocky Mountain College',
            'Billings',
            'MT',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'University of Montana–Western',
            'Dillon',
            'MT',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'University of Providence',
            'Great Falls',
            'MT',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Carolina University',
            'Winston-Salem',
            'NC',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Montreat College',
            'Montreat',
            'NC',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bismarck State College',
            'Bismarck',
            'ND',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Dickinson State University',
            'Dickinson',
            'ND',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Mayville State University',
            'Mayville',
            'ND',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Valley City State University',
            'Valley City',
            'ND',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Bellevue University',
            'Bellevue',
            'NE',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'College of Saint Mary',
            'Omaha',
            'NE',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Concordia University–Nebraska',
            'Seward',
            'NE',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Doane College',
            'Crete',
            'NE',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Hastings College',
            'Hastings',
            'NE',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Midland University',
            'Fremont',
            'NE',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Peru State College',
            'Peru',
            'NE',
            'naia',
            'Heart of America Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'York University',
            'York',
            'NE',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northern New Mexico College',
            'Española',
            'NM',
            'naia',
            'California Pacific Conference',
            ARRAY[]::text[]
        ),
(
            'University of the Southwest',
            'Hobbs',
            'NM',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Vernon Nazarene University',
            'Mount Vernon',
            'OH',
            'naia',
            'Crossroads League',
            ARRAY[]::text[]
        ),
(
            'University of Northwestern Ohio',
            'Lima',
            'OH',
            'naia',
            'Wolverine–Hoosier Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Rio Grande',
            'Rio Grande',
            'OH',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        ),
(
            'Wilberforce University',
            'Wilberforce',
            'OH',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Langston University',
            'Langston',
            'OK',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mid-America Christian University',
            'Oklahoma City',
            'OK',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Oklahoma City University',
            'Oklahoma City',
            'OK',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Oklahoma Panhandle State University',
            'Goodwell',
            'OK',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Oklahoma Wesleyan University',
            'Bartlesville',
            'OK',
            'naia',
            'Kansas Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Southwestern Christian University',
            'Bethany',
            'OK',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Science and Arts of Oklahoma',
            'Chickasha',
            'OK',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bushnell University',
            'Eugene',
            'OR',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Corban University',
            'Salem',
            'OR',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Eastern Oregon University',
            'La Grande',
            'OR',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Oregon Institute of Technology',
            'Klamath Falls',
            'OR',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Southern Oregon University',
            'Ashland',
            'OR',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Warner Pacific University',
            'Portland',
            'OR',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Savannah College of Art and Design',
            'Savannah',
            'RO',
            'naia',
            'Sun Conference',
            ARRAY[]::text[]
        ),
(
            'Columbia College',
            'Columbia',
            'SC',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Columbia International University',
            'Columbia',
            'SC',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Morris College',
            'Sumter',
            'SC',
            'naia',
            'Continental Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Spartanburg Methodist College',
            'Saxon',
            'SC',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Voorhees University',
            'Denmark',
            'SC',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Dakota State University',
            'Madison',
            'SD',
            'naia',
            'Frontier Conference',
            ARRAY[]::text[]
        ),
(
            'Dakota Wesleyan University',
            'Mitchell',
            'SD',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Marty University',
            'Yankton',
            'SD',
            'naia',
            'Great Plains Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bethel University',
            'McKenzie',
            'TN',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Bryan College',
            'Dayton',
            'TN',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Cumberland University',
            'Lebanon',
            'TN',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Fisk University',
            'Nashville',
            'TN',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Freed–Hardeman University',
            'Henderson',
            'TN',
            'naia',
            'Mid-South Conference',
            ARRAY[]::text[]
        ),
(
            'Johnson University',
            'Kimberlin Heights',
            'TN',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
(
            'Milligan University',
            'Elizabethton',
            'TN',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Tennessee Wesleyan University',
            'Athens',
            'TN',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of Tennessee Southern',
            'Pulaski',
            'TN',
            'naia',
            'Southern States Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Huston–Tillotson University',
            'Austin',
            'TX',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Jarvis Christian University',
            'Hawkins',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Nelson University',
            'Waxahachie',
            'TX',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'North American University',
            'Stafford',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Our Lady of the Lake University',
            'San Antonio',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Paul Quinn College',
            'Dallas',
            'TX',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Texas A&M University–San Antonio',
            'San Antonio',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Texas A&M University–Victoria',
            'Victoria',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Texas College',
            'Tyler',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Texas Wesleyan University',
            'Fort Worth',
            'TX',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of North Texas at Dallas',
            'Dallas',
            'TX',
            'naia',
            'Red River Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wayland Baptist University',
            'Plainview',
            'TX',
            'naia',
            'Sooner Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Wiley University',
            'Marshall',
            'TX',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'University of the Virgin Islands',
            'Saint Thomas',
            'UV',
            'naia',
            'HBCU Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Bluefield University',
            'Bluefield',
            'VA',
            'naia',
            'Appalachian Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Northwest University',
            'Kirkland',
            'WA',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'The Evergreen State College',
            'Olympia',
            'WA',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Walla Walla University',
            'College Place',
            'WA',
            'naia',
            'Cascade Collegiate Conference',
            ARRAY[]::text[]
        ),
(
            'Mount Mary University',
            'Milwaukee',
            'WI',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'Viterbo University',
            'La Crosse',
            'WI',
            'naia',
            'Chicagoland Collegiate Athletic Conference',
            ARRAY[]::text[]
        ),
(
            'West Virginia University Institute of Technology',
            'Beckley',
            'WV',
            'naia',
            'River States Conference',
            ARRAY[]::text[]
        )
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;

COMMIT;
