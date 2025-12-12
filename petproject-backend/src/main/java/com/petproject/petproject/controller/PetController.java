// package com.petproject.petproject.controller;


// import com.petproject.petproject.entity.Pet;
// import com.petproject.petproject.service.PetService;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;


// @RestController
// @RequestMapping("/api/pets")
// public class PetController {
// private final PetService petService;
// public PetController(PetService petService){ this.petService = petService; }


// @PostMapping
// public Pet createPet(@RequestBody Pet pet){ return petService.create(pet); }


// @GetMapping("/owner/{ownerId}")
// public List<Pet> getByOwner(@PathVariable Long ownerId){ return petService.getByOwner(ownerId); }


// @GetMapping("/{id}")
// public Pet getById(@PathVariable Long id){ return petService.getById(id).orElse(null); }


// @PutMapping("/{id}")
// public Pet update(@PathVariable Long id, @RequestBody Pet pet){ pet.setId(id); return petService.update(pet); }


// @DeleteMapping("/{id}")
// public void delete(@PathVariable Long id){ petService.delete(id); }


// @GetMapping("/search")
// public List<Pet> search(@RequestParam String q){ return petService.searchByName(q); }
// }