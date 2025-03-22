;; System Registration Contract
;; Records details of aquaponics installations

(define-data-var last-id uint u0)

;; Map to store system details
(define-map systems uint {
  owner: principal,
  name: (string-utf8 100),
  location: (string-utf8 100),
  system-type: (string-utf8 50),
  tank-volume: uint,
  grow-bed-area: uint,
  registration-date: uint
})

;; Get the last assigned ID
(define-read-only (get-last-id)
  (ok (var-get last-id))
)

;; Get system details by ID
(define-read-only (get-system (id uint))
  (match (map-get? systems id)
    system (ok system)
    (err u404)
  )
)

;; Register a new aquaponics system
(define-public (register-system
    (name (string-utf8 100))
    (location (string-utf8 100))
    (system-type (string-utf8 50))
    (tank-volume uint)
    (grow-bed-area uint))
  (let
    ((new-id (+ (var-get last-id) u1)))
    (var-set last-id new-id)
    (map-set systems new-id {
      owner: tx-sender,
      name: name,
      location: location,
      system-type: system-type,
      tank-volume: tank-volume,
      grow-bed-area: grow-bed-area,
      registration-date: block-height
    })
    (ok new-id)
  )
)

;; Update an existing system
(define-public (update-system
    (id uint)
    (name (string-utf8 100))
    (location (string-utf8 100))
    (system-type (string-utf8 50))
    (tank-volume uint)
    (grow-bed-area uint))
  (match (map-get? systems id)
    system (begin
      (asserts! (is-eq tx-sender (get owner system)) (err u403))
      (map-set systems id {
        owner: (get owner system),
        name: name,
        location: location,
        system-type: system-type,
        tank-volume: tank-volume,
        grow-bed-area: grow-bed-area,
        registration-date: (get registration-date system)
      })
      (ok id)
    )
    (err u404)
  )
)

;; Check if a system belongs to a specific owner
(define-read-only (is-system-owner (id uint) (owner principal))
  (match (map-get? systems id)
    system (ok (is-eq (get owner system) owner))
    (err u404)
  )
)
