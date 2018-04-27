(function() {
	let PUNCTUATION = /!|\?|\.\.\./g
	let SMILEY = /(:|;)-?(\(|\)|p|P)|\^\^/g
	let BLACKLIST = [
		/coin/ig,
		/blockchain/ig,
		/crypto.?currency/ig,
		/racist/ig,
		/fascist/ig,
		/feminist/ig,
		/petition/ig,
		/facebook/ig,
		/instagram/ig,
		/snapchat/ig
	]
	
	let WEIGHTS = {
		emoji: 1,
		punctuation: 1,
		smiley: 1,
		blacklist: 2
	}
	let THRESHOLD = 3

	let emojies = (element) => $(element).find('.Emoji').length
	let magnitude = (text, pattern) => {
		let m = text.match(pattern)
		if (m == null) {
			return 0
		}
		return m.length
	}
	let weight = (type) => {
		let w = WEIGHTS[type]
		if (w == null) {
			return 1
		}
		return w
	}
	let scores = (element) => {
		let emoji = emojies(element)
		let punctuation = magnitude(element.innerText, PUNCTUATION)
		let smiley = magnitude(element.innerText, SMILEY)
		let blacklist = BLACKLIST.map((pattern) => magnitude(element.innerText, pattern)).reduce((a, b) => a + b, 0)
		return {
			emoji: emoji,
			punctuation: punctuation,
			smiley: smiley,
			blacklist: blacklist
		}
	}
	let summary = (scores) => {
		return Object.keys(scores).map((type) => {
			return {
				type: type,
				score: scores[type],
				weight: weight(type),
				weightedScore: scores[type] * weight(type)
			}
		}).filter((entry) => {
			return entry.weightedScore > 0
		})
	}

	let clean = () => {
		$('.tweet:not(.bullshit):not(.no-bullshit) .tweet-text').toArray().forEach((element) => {
			let s = summary(scores(element))
			let b = s.reduce((r, entry) => r + entry.weightedScore, 0)
			let $tweet = $(element).closest('.tweet')
			if (b <= THRESHOLD) {
				$tweet.addClass('no-bullshit')
				return
			}
			$tweet.addClass('bullshit')
			let html = '<span>bullshit</span> ' + s.map((entry) => {
				return `${entry.score} × ${entry.weight}<sub>${entry.type}</sub>`
			}).join(' + ') + ` = ${Math.round(b, 2)} and ${Math.round(b, 2)} > ${THRESHOLD}`
			let $bullshitLabels = $('<div>').addClass('bullshit-label').html(html).prependTo($tweet)
		})
	}

	clean()

	let timeout = null;
	document.addEventListener('DOMSubtreeModified', () => {
		if (timeout) {
			clearTimeout(timeout)
		}
		timeout = setTimeout(clean, 1000)
	}, false)
})()
