;; Water Quality Monitoring Contract
;; Tracks system health and parameters

(define-data-var last-reading-id uint u0)

;; Map to store water quality readings
(define-map water-readings uint {
  system-id: uint,
  owner: principal,
  ph: uint,
  temperature: uint,
  dissolved-oxygen: uint,
  ammonia: uint,
  nitrite: uint,
  nitrate: uint,
  reading-date: uint,
  notes: (string-utf8 200)
})

;; Get the last assigned reading ID
(define-read-only (get-last-reading-id)
  (ok (var-get last-reading-id))
)

;; Get reading details by ID
(define-read-only (get-reading (id uint))
  (match (map-get? water-readings id)
    reading (ok reading)
    (err u404)
  )
)

;; Record a new water quality reading
(define-public (record-water-reading
    (system-id uint)
    (ph uint)
    (temperature uint)
    (dissolved-oxygen uint)
    (ammonia uint)
    (nitrite uint)
    (nitrate uint)
    (notes (string-utf8 200)))
  (let
    ((new-id (+ (var-get last-reading-id) u1)))
    (var-set last-reading-id new-id)
    (map-set water-readings new-id {
      system-id: system-id,
      owner: tx-sender,
      ph: ph,
      temperature: temperature,
      dissolved-oxygen: dissolved-oxygen,
      ammonia: ammonia,
      nitrite: nitrite,
      nitrate: nitrate,
      reading-date: block-height,
      notes: notes
    })
    (ok new-id)
  )
)

;; Update an existing water quality reading
(define-public (update-water-reading
    (id uint)
    (ph uint)
    (temperature uint)
    (dissolved-oxygen uint)
    (ammonia uint)
    (nitrite uint)
    (nitrate uint)
    (notes (string-utf8 200)))
  (match (map-get? water-readings id)
    reading (begin
      (asserts! (is-eq tx-sender (get owner reading)) (err u403))
      (map-set water-readings id {
        system-id: (get system-id reading),
        owner: (get owner reading),
        ph: ph,
        temperature: temperature,
        dissolved-oxygen: dissolved-oxygen,
        ammonia: ammonia,
        nitrite: nitrite,
        nitrate: nitrate,
        reading-date: (get reading-date reading),
        notes: notes
      })
      (ok id)
    )
    (err u404)
  )
)

;; Check water quality status
(define-read-only (check-water-quality (id uint))
  (match (map-get? water-readings id)
    reading (ok {
      ph-status: (check-ph (get ph reading)),
      temp-status: (check-temperature (get temperature reading)),
      ammonia-status: (check-ammonia (get ammonia reading)),
      nitrite-status: (check-nitrite (get nitrite reading))
    })
    (err u404)
  )
)

;; Helper function to check pH status
(define-private (check-ph (ph uint))
  (if (and (>= ph u65) (<= ph u75))
    "optimal"
    (if (or (and (>= ph u60) (< ph u65)) (and (> ph u75) (<= ph u80)))
      "acceptable"
      "critical"
    )
  )
)

;; Helper function to check temperature status
(define-private (check-temperature (temp uint))
  (if (and (>= temp u220) (<= temp u260))
    "optimal"
    (if (or (and (>= temp u180) (< temp u220)) (and (> temp u260) (<= temp u280)))
      "acceptable"
      "critical"
    )
  )
)

;; Helper function to check ammonia status
(define-private (check-ammonia (ammonia uint))
  (if (<= ammonia u5)
    "optimal"
    (if (<= ammonia u10)
      "acceptable"
      "critical"
    )
  )
)

;; Helper function to check nitrite status
(define-private (check-nitrite (nitrite uint))
  (if (<= nitrite u5)
    "optimal"
    (if (<= nitrite u10)
      "acceptable"
      "critical"
    )
  )
)
